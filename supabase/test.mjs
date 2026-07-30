import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { readFileSync } from "node:fs";

const db = new PGlite({ extensions: { pgcrypto, btree_gist } });

// --- shim the pieces Supabase provides that pglite doesn't ---
// auth.users table, auth.uid(), and the 'authenticated' role.
await db.exec(`
  create schema if not exists auth;
  create table auth.users (id uuid primary key);
  -- a mutable "current user" for tests
  create table public._test_ctx (uid uuid);
  insert into public._test_ctx values (null);
  create or replace function auth.uid() returns uuid language sql stable as $$
    select uid from public._test_ctx limit 1;
  $$;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname='authenticated') then
      create role authenticated;
    end if;
  end $$;
`);

async function setUser(uid) {
  await db.query(`update public._test_ctx set uid = $1`, [uid]);
}

function load(f) { return readFileSync(`./supabase/migrations/${f}`, "utf8"); }

let pass = 0, fail = 0;
function ok(name, cond, extra="") { (cond?pass++:fail++); console.log(`${cond?"✓":"✗ FAIL"}  ${name}${extra&&!cond?" — "+extra:""}`); }

try {
  // apply migrations in order
  for (const f of ["0001_core_schema.sql","0002_rpcs.sql","0003_rls.sql"]) {
    await db.exec(load(f));
    console.log(`applied ${f}`);
  }
  ok("migrations apply cleanly", true);

  // seed two users + a business owned by user A
  const A = "11111111-1111-1111-1111-111111111111";
  const B = "22222222-2222-2222-2222-222222222222";
  await db.exec(`insert into auth.users(id) values ('${A}'),('${B}')`);

  await setUser(A);
  const biz = await db.query(
    `insert into public.businesses(owner_id,name,slug) values ($1,'Crown & Coils','crown-coils') returning id`, [A]);
  const bizId = biz.rows[0].id;
  await db.query(`insert into public.business_members(business_id,user_id,role) values ($1,$2,'owner')`, [bizId, A]);
  ok("owner can create business + membership", !!bizId);

  // add a resource so overlap constraint applies (needs resource_id)
  const res = await db.query(
    `insert into public.resources(business_id,name) values ($1,'Nia') returning id`, [bizId]);
  const resId = res.rows[0].id;

  // a service
  await db.query(`insert into public.services(business_id,name,duration_min,price_cents)
                  values ($1,'Knotless medium',360,22000)`, [bizId]);

  // --- create an appointment via the RPC ---
  const start = "2026-08-01T14:00:00Z";
  const appt = await db.query(
    `select public.create_studio_appointment($1,'Jordan P.','jordan@x.com','','','Knotless medium',$2::timestamptz,360,22000,$3) as id`,
    [bizId, start, resId]);
  ok("create_studio_appointment returns id", !!appt.rows[0].id);

  // client was upserted + visit_count bumped
  const cl = await db.query(`select visit_count, no_show_count from public.clients where email='jordan@x.com'`);
  ok("client upserted with visit_count=1", cl.rows[0]?.visit_count === 1);

  // confirmation queued in outbox
  const ob = await db.query(`select count(*)::int n from public.notification_outbox where template='confirmation'`);
  ok("confirmation queued in outbox", ob.rows[0].n === 1);

  // --- THE KEY TEST: overlapping booking on same resource is rejected ---
  let overlapRejected = false;
  try {
    await db.query(
      `select public.create_studio_appointment($1,'Sam T.','sam@x.com','','','Knotless medium',$2::timestamptz,360,22000,$3)`,
      [bizId, "2026-08-01T16:00:00Z", resId]); // starts inside the 14:00-20:00 block
  } catch (e) {
    overlapRejected = /overlap/i.test(e.message);
  }
  ok("double-booking on same resource rejected", overlapRejected);

  // --- a NON-overlapping booking on same resource succeeds ---
  const appt2 = await db.query(
    `select public.create_studio_appointment($1,'Dana W.','dana@x.com','','','Knotless medium',$2::timestamptz,120,22000,$3) as id`,
    [bizId, "2026-08-01T21:00:00Z", resId]);
  ok("non-overlapping booking succeeds", !!appt2.rows[0].id);

  // --- cancelling frees the slot: cancel appt1, then rebook same time ---
  const appt1Id = appt.rows[0].id;
  await db.query(`select public.update_studio_appointment_status($1,'cancelled','client request')`, [appt1Id]);
  let rebookedAfterCancel = false;
  try {
    const r = await db.query(
      `select public.create_studio_appointment($1,'Mia R.','mia@x.com','','','Knotless medium',$2::timestamptz,360,22000,$3) as id`,
      [bizId, start, resId]);
    rebookedAfterCancel = !!r.rows[0].id;
  } catch(e) { rebookedAfterCancel = false; }
  ok("cancelled slot can be rebooked", rebookedAfterCancel);

  // --- no_show increments client's no_show_count ---
  const appt2Id = appt2.rows[0].id;
  await db.query(`select public.update_studio_appointment_status($1,'no_show','')`, [appt2Id]);
  const ns = await db.query(`select no_show_count from public.clients where email='dana@x.com'`);
  ok("no_show bumps client no_show_count", ns.rows[0].no_show_count === 1);

  // --- authorization: user B (not a member) cannot book on A's business ---
  await setUser(B);
  let blockedNonMember = false;
  try {
    await db.query(
      `select public.create_studio_appointment($1,'Hacker','h@x.com','','','X',$2::timestamptz,60,0,$3)`,
      [bizId, "2026-08-02T10:00:00Z", resId]);
  } catch(e) { blockedNonMember = /not authorized/i.test(e.message); }
  ok("non-member cannot book on someone else's business", blockedNonMember);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
} catch (e) {
  console.error("HARNESS ERROR:", e.message);
  process.exit(1);
}
