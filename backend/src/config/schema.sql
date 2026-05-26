-- WeFarm Database Schema
-- Run this SQL to initialize your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  nursery_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  whatsapp_number VARCHAR(15),
  address TEXT NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Andhra Pradesh',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  courier_available BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  plant_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'other',
  days_old INTEGER NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  image_public_ids TEXT[] DEFAULT '{}',
  contact_number VARCHAR(15) NOT NULL,
  whatsapp_number VARCHAR(15),
  nursery_name VARCHAR(100),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  courier_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 days'
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_seller ON posts(seller_id);
CREATE INDEX IF NOT EXISTS idx_posts_location ON posts(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_posts_expires ON posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_phone ON sellers(phone_number);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
