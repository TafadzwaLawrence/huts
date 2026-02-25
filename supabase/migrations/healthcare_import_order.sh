#!/bin/bash
# Quick script to display import order

echo "🏥 HEALTHCARE FACILITIES MIGRATION - IMPORT ORDER"
echo "=================================================="
echo ""
echo "Run these files IN ORDER in Supabase SQL Editor:"
echo ""
echo "1️⃣  022_healthcare_facilities.sql      (FIRST - creates table & functions)"
echo "2️⃣  022_healthcare_data_part_a.sql   (Part 1/2 - 850 facilities)"
echo "3️⃣  022_healthcare_data_part_b.sql   (Part 2/2 - 838 facilities)"
echo ""
echo "=================================================="
echo "Total: 1688 healthcare facilities across Zimbabwe"
echo ""
echo "After import, verify with:"
echo "  SELECT COUNT(*) FROM healthcare_facilities;"
echo "  -- Should return: 1688"
