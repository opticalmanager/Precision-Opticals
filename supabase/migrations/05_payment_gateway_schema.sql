-- Migration 05: Payment Gateway & Transaction Ledger Schema
-- Enhances public.orders to store gateway transaction references and cryptographic metadata

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}';

-- Create index on payment_id for rapid reconciliation and transaction search
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON public.orders(payment_method);
