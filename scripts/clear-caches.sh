#!/bin/bash
# Clear all caches and restart dev server

echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "🔄 Restarting dev server..."
echo "Press Ctrl+C to stop the current dev server, then run: npm run dev"
echo ""
echo "💡 IMPORTANT: After server restarts:"
echo "   1. Hard refresh browser: Ctrl+Shift+R (Linux) or Cmd+Shift+R (Mac)"
echo "   2. Or open DevTools → Network tab → Disable cache checkbox"
echo "   3. Try deleting a property again"
