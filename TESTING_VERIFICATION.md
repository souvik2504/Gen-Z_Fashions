# 🧪 Testing & Verification Guide

## Pre-Deployment Testing (Local)

### 1. Build Test (5 minutes)
```bash
cd client
npm run build

# Check output
ls -lh build/
# Should see:
# - build/index.html
# - build/static/js/ (multiple .js files = code splitting ✅)
# - build/static/css/
```

**Expected:** Build completes without errors, creates `build/` folder.

---

### 2. Bundle Size Test
```bash
# Check bundle size
du -sh client/build/static/js/main.*

# Expected: ~150KB (was ~350KB)
```

**Verification:** If main bundle is under 200KB, code splitting is working ✅

---

### 3. Local Server Test
```bash
cd server
npm install compression  # Install new dependency
npm start

# Should see:
# ✅ MongoDB connected
# ✅ Email service is ready
# ✅ Server running on port 5000
```

**Expected:** No errors, server starts successfully.

---

### 4. Browser Load Test
```bash
# Clear all browser cache
# Open DevTools (F12)
# Go to Network tab
# Check "Disable cache" checkbox
# Reload page (Ctrl+Shift+R)

# Verify:
- initial load < 2.5 seconds
- No errors in Console
- No failed requests in Network
- Images load
- Navigation works
```

**Expected:** Page interactive in 1.5-2 seconds.

---

## Functionality Testing

### 5. Core Features Test (10 minutes)

#### Home Page
- [ ] Banner slideshow displays
- [ ] Category cards visible
- [ ] Featured products load
- [ ] Navigation bar accessible
- [ ] Search box functional

#### Products Page
- [ ] Products load and display
- [ ] Filtering works
- [ ] Pagination works
- [ ] Can click product

#### Product Detail
- [ ] Product info displays
- [ ] Images display
- [ ] "Add to Cart" button works
- [ ] Reviews section loads

#### Cart
- [ ] Items in cart show
- [ ] Can update quantity
- [ ] Can remove items
- [ ] Checkout button accessible

#### Checkout
- [ ] Order summary displays
- [ ] Can select payment method
- [ ] Razorpay modal opens (if selected)
- [ ] Cash on Delivery works

#### Authentication
- [ ] Login works
- [ ] Register works
- [ ] Logout works
- [ ] User profile accessible

#### Admin (if you're admin user)
- [ ] Admin dashboard loads
- [ ] Can view orders
- [ ] Can manage products
- [ ] Can view users

---

## Performance Testing

### 6. Load Time Analysis (using Chrome DevTools)

```
1. Open DevTools (F12)
2. Go to Network tab
3. Click reload button
4. Wait for page to fully load

Look for:
- DOMContentLoaded: < 1.5 seconds ✅
- Load: < 2 seconds ✅
- Largest request < 100KB ✅
- Total size < 500KB ✅
```

### 7. Lighthouse Audit

```
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Performance" category
4. Click "Analyze page load"

Target scores:
- Performance: > 85 ✅
- Best Practices: > 90 ✅
- Accessibility: > 90 ✅
- SEO: > 90 ✅
```

### 8. Mobile Simulation

```
1. DevTools > Network tab
2. Set throttling to "3G Fast"
3. Reload page
4. Should still load in < 3 seconds

Or use Chrome DevTools throttling:
- Device: iPhone 12
- Network: Slow 3G
- Check if usable in < 3 seconds
```

---

## Network Request Analysis

### 9. API Response Compression

```
1. DevTools > Network tab
2. Click on API request (e.g., /api/products)
3. Check Response Headers:
   - content-encoding: gzip ✅
   - Transfer-Size: < 100KB ✅

4. Check if compressed:
   - Size shows two numbers
   - First (larger) = uncompressed
   - Second (smaller) = compressed
   - Example: 200KB / 60KB = 70% smaller ✅
```

### 10. Code Splitting Verification

```
1. DevTools > Network tab
2. Reload page
3. Check static/js/ folder
4. Should see:
   - main.*.js (50-150KB)
   - Multiple chunk files
   - Not: one giant file

5. Go to /admin route
6. Check Network tab for:
   - New chunk files loading
   - Main bundle unchanged (already cached)

Result: On-demand loading working ✅
```

---

## Performance Metrics

### 11. Core Web Vitals Check

In DevTools Console, run:
```javascript
// Get Core Web Vitals
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.value);
  }
}).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
```

Expected values:
- LCP (Largest Contentful Paint): < 2.5s ✅
- FID (First Input Delay): < 100ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

---

## Security Checks

### 12. Source Maps Verification

```bash
# Check production build
ls -la client/build/static/js/

# Should see:
# ✅ main.*.js files
# ❌ NO .map files (source maps disabled)

# If you see .map files, rebuild:
cd client
npm run build
```

---

## Production Deployment Testing

### Before Going Live:

1. **Staging Test**
   ```bash
   NODE_ENV=production npm start
   # Test at http://localhost:5000
   # Run all tests above on staging
   ```

2. **Monitor Server Health**
   ```javascript
   // Check server logs for errors
   // Monitor memory usage
   // Monitor response times
   ```

3. **Database Backup**
   ```bash
   # Backup MongoDB before deployment
   node server/exportDatabase.js
   ```

4. **Rollback Plan**
   ```bash
   # If issues occur, rollback:
   git reset --hard HEAD~1
   npm install
   npm start
   ```

---

## Post-Deployment Verification

### Day 1 Checklist:

- [ ] Site loads in production
- [ ] All pages accessible
- [ ] Payment processing works
- [ ] Emails send correctly
- [ ] No console errors
- [ ] Lighthouse score > 85
- [ ] Mobile works smooth
- [ ] No API timeouts

### Week 1 Monitoring:

- [ ] Page load times consistent
- [ ] No memory leaks
- [ ] Server resources healthy
- [ ] User engagement up (from faster site)
- [ ] Error rate low
- [ ] Database performance normal

### Ongoing:

- [ ] Monitor Lighthouse monthly
- [ ] Check Core Web Vitals
- [ ] Track real user metrics
- [ ] Optimize further if needed

---

## Troubleshooting Issues

### Site Slow After Deployment

**Check:**
1. Compression middleware installed? `npm list compression`
2. Production build created? `ls client/build/`
3. NODE_ENV=production set?
4. Server restarted after changes?

**Fix:**
```bash
npm install compression
npm run build
NODE_ENV=production npm start
```

### CSS/Images Not Loading

**Check:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check file permissions
3. Check upload folder exists

**Fix:**
```bash
# Rebuild
cd client && npm run build
# Check uploads folder
ls -la server/uploads/
```

### API Requests Slow

**Check:**
1. Compression enabled in Network tab?
2. Database indexes present?
3. Network throttling in DevTools?

**Fix:**
```javascript
// In server.js, verify:
app.use(compression());
```

### OAuth/Authentication Issues

**Check:**
1. REACT_APP_GOOGLE_CLIENT_ID in .env?
2. Google OAuth provider loading?
3. Check browser console for errors

**Fix:**
```bash
# Verify env variables
echo $REACT_APP_GOOGLE_CLIENT_ID

# Restart
npm start
```

---

## Performance Regression Testing

### Before Next Update:

1. Measure current performance
2. Record baseline metrics
3. After updates, re-measure
4. Alert if > 10% regression

```bash
# Create baseline
npm run build
npm start
# Record Lighthouse score
# Record load time
# Record bundle size
```

---

## Sign-Off Checklist

- [ ] All features work
- [ ] Load time < 2s
- [ ] Lighthouse > 85
- [ ] Mobile responsive
- [ ] No console errors
- [ ] API compressed
- [ ] Static files cached
- [ ] Rollback plan ready

---

**Ready for production!** 🚀

After deploying, monitor for 24-48 hours, then celebrate the speed improvement! 🎉

---
*Last Updated: January 22, 2026*
