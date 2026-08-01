import re

with open(r'C:\Repos\smartphone-accessories-store\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_text(content, old, new):
    """Replace text that might have whitespace/newlines between words"""
    pattern = re.escape(old)
    pattern = pattern.replace(r'\ ', r'\s+')
    return re.sub(pattern, new, content, flags=re.DOTALL)

# ============================================================
# 1. Product names in "Most Popular Products" section
#    (each appears in: aria-label, <h3> title, add-to-cart aria-label, success_message)
# ============================================================

# iPhone Leather Wallet Black
content = replace_text(content, 'iPhone Leather Wallet Black', 'محفظة آيفون الجلدية - أسود')

# Everyday Leather Strap – Olive (en-dash)
content = replace_text(content, 'Everyday Leather Strap \u2013 Olive', 'سوار جلدي يومي - زيتوني')
# Also handle regular dash variant in add-to-cart attributes
content = replace_text(content, 'Everyday Leather Strap - Olive', 'سوار جلدي يومي - زيتوني')

# Case for AirPods – Blue (en-dash)
content = replace_text(content, 'Case for AirPods \u2013 Blue', 'جراب إيربودز - أزرق')
# Also handle regular dash variant
content = replace_text(content, 'Case for AirPods - Blue', 'جراب إيربودز - أزرق')

# iPhone 13 Case – Smokey Black (en-dash)
content = replace_text(content, 'iPhone 13 Case \u2013 Smokey Black', 'جراب آيفون 13 - أسود مدخن')
# Also handle regular dash variant
content = replace_text(content, 'iPhone 13 Case - Smokey Black', 'جراب آيفون 13 - أسود مدخن')

# Lightning Cable USB-A
content = replace_text(content, 'Lightning Cable USB-A', 'كابل لايتننق USB-A')

# Fast Wireless Charger 3in1
content = replace_text(content, 'Fast Wireless Charger 3in1', 'شاحن لاسلكي سريع 3 في 1')

# ============================================================
# 2. Button texts split across lines in Most Popular Products
# ============================================================

# "Add to wishlist" multiline pattern (16 remaining instances)
content = replace_text(content, 'Add to wishlist', 'أضف للمفضلة')

# "Add to cart" multiline pattern (6 remaining instances in popular products)
content = replace_text(content, 'Add to cart', 'أضف للسلة')

# ============================================================
# 3. Success message suffix
# ============================================================

# "has been added to your cart" in data-success_message attributes (16 instances)
content = replace_text(content, 'has been added to your cart', 'تمت الإضافة إلى سلة التسوق')

# ============================================================
# 4. JavaScript woodmart_settings i18n strings
# ============================================================

content = content.replace(
    '"adding_to_cart": "Processing"',
    '"adding_to_cart": "جارٍ المعالجة"'
)
content = content.replace(
    '"added_to_cart": "Product was successfully added to your cart."',
    '"added_to_cart": "تمت إضافة المنتج إلى سلة التسوق بنجاح."'
)
content = content.replace(
    '"continue_shopping": "Continue shopping"',
    '"continue_shopping": "متابعة التسوق"'
)
content = content.replace(
    '"view_cart": "View Cart"',
    '"view_cart": "عرض السلة"'
)
content = content.replace(
    '"go_to_checkout": "Checkout"',
    '"go_to_checkout": "إتمام الشراء"'
)
content = content.replace(
    '"loading": "Loading..."',
    '"loading": "جارٍ التحميل..."'
)
content = content.replace(
    '"countdown_days": "days"',
    '"countdown_days": "يوم"'
)
content = content.replace(
    '"countdown_hours": "hr"',
    '"countdown_hours": "ساعة"'
)
content = content.replace(
    '"countdown_mins": "min"',
    '"countdown_mins": "دقيقة"'
)
content = content.replace(
    '"countdown_sec": "sc"',
    '"countdown_sec": "ثانية"'
)
content = content.replace(
    '"all_results": "View all results"',
    '"all_results": "عرض جميع النتائج"'
)
content = content.replace(
    '"close": "Close",',
    '"close": "إغلاق",'
)
content = content.replace(
    '"share_fb": "Share on Facebook"',
    '"share_fb": "مشاركة على فيسبوك"'
)
content = content.replace(
    '"pin_it": "Pin it"',
    '"pin_it": "تثبيت"'
)
content = content.replace(
    '"tweet": "Share on X"',
    '"tweet": "مشاركة على X"'
)
content = content.replace(
    '"download_image": "Download image"',
    '"download_image": "تحميل الصورة"'
)
content = content.replace(
    '"off_canvas_column_close_btn_text": "Close"',
    '"off_canvas_column_close_btn_text": "إغلاق"'
)

# Write the result
with open(r'C:\Repos\smartphone-accessories-store\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Third translation script complete!")
