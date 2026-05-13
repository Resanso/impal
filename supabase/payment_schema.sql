-- ============================================================
-- Payment Schema - Jalankan di Supabase SQL Editor
-- ============================================================

create table if not exists payment (
  id               serial primary key,
  pemesanan_id     int references pemesanan(id) unique,
  mayar_invoice_id text,
  mayar_link       text,
  amount           numeric(10,2) not null,
  status           text not null default 'pending', -- 'pending' | 'paid' | 'failed'
  paid_at          timestamptz,
  created_at       timestamptz default now()
);

alter table payment enable row level security;

-- User bisa baca payment miliknya
create policy "payment_select" on payment for select using (
  exists (
    select 1 from pemesanan p
    where p.id = pemesanan_id and p.user_id = auth.uid()
  )
);

-- Insert dibatasi untuk authenticated user yang punya pemesanan
create policy "payment_insert" on payment for insert with check (
  exists (
    select 1 from pemesanan p
    where p.id = pemesanan_id and p.user_id = auth.uid()
  )
);

create policy "payment_update" on payment for update using (
  exists (
    select 1 from pemesanan p
    where p.id = pemesanan_id and p.user_id = auth.uid()
  )
);
