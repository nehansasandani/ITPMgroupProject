# Background Image Setup Guide

## Pages with Background Images

This guide covers setup for two pages:
1. **Rating Form Page** - Blurred background behind the form
2. **Leaderboard Page** - Hero banner at the top

---

## Upload Location (Both Images)

Place both images in:
```
d:\ITPM\ITPMgroupProject\frontend\public\
```

---

## Image 1: Rating Form Background

### File Details
- **Filename**: `background-image.jpg`
- **Full Path**: `d:\ITPM\ITPMgroupProject\frontend\public\background-image.jpg`
- **Size**: 1920x1080 px or larger
- **Format**: .jpg, .png, or .webp
- **File Size**: Under 5MB recommended

### What It Does
- Appears as a blurred background behind the rating form
- Has 55% dark overlay for text readability
- 2px backdrop blur effect
- Elegant, subtle appearance

---

## Image 2: Leaderboard Hero Banner

### File Details
- **Filename**: `leaderboard-hero.jpg`
- **Full Path**: `d:\ITPM\ITPMgroupProject\frontend\public\leaderboard-hero.jpg`
- **Size**: 1920x1080 px or larger (16:9 aspect ratio best)
- **Format**: .jpg, .png, or .webp
- **File Size**: Under 5MB recommended

### What It Does
- Full-width hero banner at the top of leaderboard page
- Features 3 stat cards with glassmorphism effect
- 50% dark overlay with smooth blur
- Displays top performer, member count, highest score
- Eye-catching, professional appearance

---

## File Organization

```
frontend/
├── public/
│   ├── background-image.jpg      ← Rating Form background
│   ├── leaderboard-hero.jpg      ← Leaderboard hero banner
│   └── [other public files]
└── src/
    └── pages/
        └── reputation/
            ├── RatingForm.jsx
            └── LeaderboardPage.jsx
```

---

## Image Recommendations

### Best Image Types
- Professional photography backgrounds
- Blurred tech/office backgrounds  
- Gradient backgrounds with depth
- Minimalist abstract designs
- Achievement/success themed images
- Bokeh/depth of field effects

### What Works Well
✅ Subtle, high-quality images
✅ Darker tones (blend well with UI)
✅ Images with depth/layers
✅ Wide aspect ratios (16:9)
✅ Professional photos

### Avoid
❌ Very bright images (overlay makes them dark)
❌ Busy/chaotic patterns (blur effect softens details)
❌ Small, low-resolution images
❌ Images with important text (will be blurred)

---

## Blur & Overlay Effects

### Rating Form Page
```
Backdrop blur: 2px
Dark overlay: rgba(10, 14, 26, 0.55)
Effect: Subtle, elegant
```

### Leaderboard Page
```
Backdrop blur: Smooth effect
Dark overlay: rgba(0, 0, 0, 0.50)
Stats cards: Extra blur + transparency
Effect: Professional hero banner
```

---

## Troubleshooting

### Image Not Showing?
1. Check file is in `frontend/public/`
2. Verify exact filename (case-sensitive)
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear cache if needed

### Image Too Bright?
- Try an image with more contrast
- Blur + overlay effect is intentional
- Darker images work best

### Wrong Image File Size?
- Compress with TinyPNG or imagemin
- Keep under 5MB
- HD resolution minimum (1920x1080)

---

**Ready?** Upload both images to `frontend/public/` and enjoy! 🎨✨
