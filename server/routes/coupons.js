// // routes/coupons.js
// const express = require("express");
// const router = express.Router();
// const auth = require("../middleware/auth");
// const User = require("../models/User");

// router.post("/apply", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { code, orderTotal } = req.body;

//     if (!code) {
//       return res.status(400).json({ message: "Coupon code is required" });
//     }

//     // Prevent coupon use on zero total (no items)
//     const parsedTotal = parseFloat(orderTotal);
//     if (!parsedTotal || parsedTotal <= 0) {
//       return res
//         .status(400)
//         .json({ message: "Invalid order. Add items to apply coupon." });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // 🔥 ENHANCED: More strict coupon validation with better error messages
//     const coupon = user.loyalty?.claimedCoupons?.find(
//       (c) => c.code === code && 
//              !c.usedAt && // Must NOT be used already (final usage)
//              new Date(c.expiresAt) > new Date() // Must NOT be expired
//     );

//     if (!coupon) {
//       // 🔥 CHECK: Provide specific error messages
//       const existingCoupon = user.loyalty?.claimedCoupons?.find(c => c.code === code);
      
//       if (!existingCoupon) {
//         return res.status(400).json({ message: "Invalid coupon code" });
//       }
      
//       if (existingCoupon.usedAt) {
//         return res.status(400).json({ message: "This coupon has already been used" });
//       }
      
//       if (new Date(existingCoupon.expiresAt) <= new Date()) {
//         return res.status(400).json({ message: "This coupon has expired" });
//       }
      
//       return res.status(400).json({ message: "Invalid or expired coupon" });
//     }

//     let description = coupon.description || coupon.surprise;

//     if (!description || typeof description !== "string") {
//       description = "10% off next order";
//       const index = user.loyalty.claimedCoupons.findIndex(
//         (c) => c.code === code
//       );
//       if (index !== -1) {
//         user.loyalty.claimedCoupons[index].description = description;
//         await user.save();
//       }
//     }

//     let discount = 0;
//     const desc = description.toLowerCase();

//     if (desc.includes("10% off")) discount = parsedTotal * 0.1;
//     else if (desc.includes("20% off")) discount = parsedTotal * 0.2;
//     else if (desc.includes("40% off")) discount = parsedTotal * 0.4;
//     else if (desc.includes("buy 1 get 1 free")) discount = parsedTotal * 0.5;
//     else if (desc.includes("100 rupees") || desc.includes("₹100"))
//       discount = 100;
//     else discount = parsedTotal * 0.05; // Default 5% if no specific match

//     const newTotal = Math.max(0, parsedTotal - discount);

//     // 🔥 IMPORTANT: Only mark as applied temporarily - NOT as used
//     // The coupon should only be marked as 'usedAt' after successful payment
//     const couponIndex = user.loyalty.claimedCoupons.findIndex((c) => c.code === code && !c.usedAt);
//     if (couponIndex !== -1) {
//       user.loyalty.claimedCoupons[couponIndex].appliedAt = new Date();
//       await user.save();
//     }

//     console.log(`✅ Coupon ${code} applied successfully for user ${userId} (not yet used)`);

//     res.json({
//       message: "Coupon applied successfully",
//       discount,
//       newTotal,
//       coupon: {
//         code: coupon.code,
//         description,
//       },
//     });
//   } catch (error) {
//     console.error("Error applying coupon:", error);
//     res.status(500).json({ message: "Failed to apply coupon" });
//   }
// });

// module.exports = router;


// routes/coupons.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/apply", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    // Validate order total
    const parsedTotal = parseFloat(orderTotal);
    if (!parsedTotal || parsedTotal <= 0) {
      return res.status(400).json({ 
        message: "Invalid order. Add items to apply coupon." 
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 FIXED: Find coupon in user.loyalty.claimedCoupons (your existing structure)
    const coupon = user.loyalty?.claimedCoupons?.find(
      (c) => c.code === code && 
             !c.usedAt && // Must NOT be used already
             new Date(c.expiresAt) > new Date() // Must NOT be expired
    );

    if (!coupon) {
      // 🔥 Better error handling with specific messages
      const existingCoupon = user.loyalty?.claimedCoupons?.find(c => c.code === code);
      
      if (!existingCoupon) {
        return res.status(400).json({ message: "Invalid coupon code or you don't own this coupon" });
      }
      
      if (existingCoupon.usedAt) {
        return res.status(400).json({ message: "This coupon has already been used" });
      }
      
      if (new Date(existingCoupon.expiresAt) <= new Date()) {
        return res.status(400).json({ message: "This coupon has expired" });
      }
      
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    // 🔥 FIXED: Get description (surprise field contains the discount info)
    let description = coupon.description || coupon.surprise;

    if (!description || typeof description !== "string") {
      description = "10% off next order"; // Default fallback
      // Update the coupon with default description
      const index = user.loyalty.claimedCoupons.findIndex(c => c.code === code);
      if (index !== -1) {
        user.loyalty.claimedCoupons[index].description = description;
        await user.save();
      }
    }

    // 🔥 FIXED: Calculate discount based on description (your original logic)
    let discount = 0;
    const desc = description.toLowerCase();

    console.log('🔍 Calculating discount for description:', desc);

    if (desc.includes("10% off") || desc.includes("10%")) {
      discount = parsedTotal * 0.1;
      console.log('✅ Applied 10% discount:', discount);
    } else if (desc.includes("20% off") || desc.includes("20%")) {
      discount = parsedTotal * 0.2;
      console.log('✅ Applied 20% discount:', discount);
    } else if (desc.includes("30% off") || desc.includes("30%")) {
      discount = parsedTotal * 0.3;
      console.log('✅ Applied 30% discount:', discount);
    } else if (desc.includes("40% off") || desc.includes("40%")) {
      discount = parsedTotal * 0.4;
      console.log('✅ Applied 40% discount:', discount);
    } else if (desc.includes("50% off") || desc.includes("50%")) {
      discount = parsedTotal * 0.5;
      console.log('✅ Applied 50% discount:', discount);
    } else if (desc.includes("buy 1 get 1 free") || desc.includes("bogo")) {
      discount = parsedTotal * 0.5; // 50% off for BOGO
      console.log('✅ Applied BOGO discount:', discount);
    } else if (desc.includes("100 rupees") || desc.includes("₹100") || desc.includes("rs 100")) {
      discount = Math.min(100, parsedTotal); // Don't exceed order total
      console.log('✅ Applied ₹100 fixed discount:', discount);
    } else if (desc.includes("200 rupees") || desc.includes("₹200") || desc.includes("rs 200")) {
      discount = Math.min(200, parsedTotal);
      console.log('✅ Applied ₹200 fixed discount:', discount);
    } else if (desc.includes("500 rupees") || desc.includes("₹500") || desc.includes("rs 500")) {
      discount = Math.min(500, parsedTotal);
      console.log('✅ Applied ₹500 fixed discount:', discount);
    } else {
      // Default 5% if no specific match
      discount = parsedTotal * 0.05;
      console.log('⚠️ Applied default 5% discount:', discount);
    }

    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, parsedTotal);
    const newTotal = Math.max(0, parsedTotal - discount);

    // 🔥 IMPORTANT: Mark as applied temporarily (not used yet)
    const couponIndex = user.loyalty.claimedCoupons.findIndex((c) => c.code === code && !c.usedAt);
    if (couponIndex !== -1) {
      user.loyalty.claimedCoupons[couponIndex].appliedAt = new Date();
      user.loyalty.claimedCoupons[couponIndex].orderTotal = parsedTotal;
      await user.save();
    }

    console.log(`✅ Coupon ${code} applied successfully:`, {
      userId,
      discount: discount,
      newTotal: newTotal,
      description: description
    });

    res.json({
      message: "Coupon applied successfully",
      discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
      newTotal: Math.round(newTotal * 100) / 100,
      coupon: {
        code: coupon.code,
        description: description,
        expiresAt: coupon.expiresAt
      },
    });

  } catch (error) {
    console.error("❌ Error applying coupon:", error);
    res.status(500).json({ message: "Failed to apply coupon" });
  }
});

// 🔥 ADD: Route to mark coupon as used after successful payment
router.post("/use", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find and mark coupon as used
    const couponIndex = user.loyalty?.claimedCoupons?.findIndex(
      (c) => c.code === code && !c.usedAt && c.appliedAt
    );

    if (couponIndex === -1) {
      return res.status(400).json({ message: "No applied coupon found" });
    }

    // Mark as used
    user.loyalty.claimedCoupons[couponIndex].usedAt = new Date();
    await user.save();

    console.log(`✅ Coupon ${code} marked as used for user ${userId}`);

    res.json({
      message: "Coupon used successfully",
      success: true
    });

  } catch (error) {
    console.error("❌ Error using coupon:", error);
    res.status(500).json({ message: "Failed to mark coupon as used" });
  }
});

// 🔥 ADD: Route to remove applied coupon (if user changes mind)
router.post("/remove", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find and remove applied status
    const couponIndex = user.loyalty?.claimedCoupons?.findIndex(
      (c) => c.code === code && !c.usedAt && c.appliedAt
    );

    if (couponIndex === -1) {
      return res.status(400).json({ message: "No applied coupon found" });
    }

    // Remove applied status
    delete user.loyalty.claimedCoupons[couponIndex].appliedAt;
    delete user.loyalty.claimedCoupons[couponIndex].orderTotal;
    await user.save();

    console.log(`✅ Coupon ${code} removed from application for user ${userId}`);

    res.json({
      message: "Coupon removed successfully",
      success: true
    });

  } catch (error) {
    console.error("❌ Error removing coupon:", error);
    res.status(500).json({ message: "Failed to remove coupon" });
  }
});

module.exports = router;

