import re

with open(r'C:\Repos\smartphone-accessories-store\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# HTML structure changes
content = content.replace('<html lang="en-US"', '<html lang="ar" dir="rtl"')
content = content.replace('lang="en-US"', 'lang="ar"')

# Title
content = content.replace('<title data--h-bstatus="0OBSERVED">Accessories WordPress theme | WoodMart</title>', '<title data--h-bstatus="0OBSERVED">إكسسوارات الجوال | متجركم للإكسسوارات</title>')

# Meta description
old_desc = 'content="WoodMart is a premium WooCommerce theme that is perfectly optimized for performance. Build your online store without hassle."'
new_desc = 'content="وود مارت هو قالب ووكومرس متميز محسن للأداء. أنشئ متجرك الإلكتروني بسهولة."'
content = content.replace(old_desc, new_desc)

# og:title
content = content.replace('content="Accessories WordPress theme | WoodMart"', 'content="إكسسوارات الجوال | متجركم للإكسسوارات"')

# og:site_name
content = content.replace('content="WoodMart Accessories"', 'content="إكسسوارات وود مارت"')

# RSS feed title
content = content.replace('title="WoodMart Accessories \u00bb Feed"', 'title="إكسسوارات وود مارت » الخلاصة"')
content = content.replace('title="WoodMart Accessories \u00bb Comments Feed"', 'title="إكسسوارات وود مارت » خلاصة التعليقات"')

# Yoast breadcrumb - "Home"
content = content.replace('"name":"Home"', '"name":"الرئيسية"')

# Yoast description
content = content.replace('"description":"Multipurpose WooCommerce Accessories Theme"', '"description":"قالب ووكومرس متعدد الأغراض لإكسسوارات الجوال"')

# Yoast name
content = content.replace('"name":"Accessories"', '"name":"الإكسسوارات"')

# Schema name - "Accessories WordPress theme | WoodMart" in JSON
content = content.replace('"name":"Accessories WordPress theme | WoodMart"', '"name":"إكسسوارات الجوال | متجركم للإكسسوارات"')

# Navigation Menu - main items
translations = {
    '>Cases<': '>الجوالات<',
    '>Straps<': '>الأحزمة<',
    '>Power Banks<': '>بطاريات خارجية<',
    '>Cables<': '>الكابلات<',
    '>MagSafe<': '>ماج سيف<',
    '>Charger<': '>شواحن<',
    '>More<': '>المزيد<',
    '>Battery case<': '>علبة بطارية<',
    '>Powerful<': '>قوية<',
    '>Wireless<': '>لاسلكية<',
    '>MagSafe Battery<': '>بطارية ماج سيف<',
    '>Wallet<': '>محفظة<',
    '>Charging pads<': '>قواعد شحن<',
    '>Stands &amp; docks<': '>حوامل وقواعد<',
    '>Shop<': '>المتجر<',
    '>Blog<': '>المدونة<',
    '>About Us<': '>من نحن<',
    '>Contact Us<': '>اتصل بنا<',
    '>Privacy Policy<': '>سياسة الخصوصية<',
    '>Shipping<': '>الشحن<',
    '>Track Order<': '>تتبع الطلب<',
    '>FAQs<': '>الأسئلة الشائعة<',
    '>Canvas<': '>قماش<',
    '>Leather<': '>جلد<',
    '>Limited series<': '>سلسلة محدودة<',
    '>Metal<': '>معدن<',
    '>Silicone<': '>سيليكون<',
    '>Sport<': '>رياضي<',
    '>Lightning<': '>لايتنينغ<',
    '>Universal<': '>عالمي<',
    '>USB-C<': '>USB-C<',
}

for eng, arabic in translations.items():
    content = content.replace(eng, arabic)

# Navigation items - submenu level with different notation
sub_translations = {
    '>IPhone 13<': '>آيفون 13<',
    '>IPhone 12 pro<': '>آيفون 12 برو<',
    '>IPhone 12<': '>آيفون 12<',
    '>IPhone 11 pro<': '>آيفون 11 برو<',
    '>IPhone 11<': '>آيفون 11<',
    '>IPhone SE<': '>آيفون SE<',
    '>IPhone XR<': '>آيفون XR<',
}

for eng, arabic in sub_translations.items():
    content = content.replace(eng, arabic)

# Header tools
content = content.replace('Login / Register', 'تسجيل الدخول / التسجيل')
content = content.replace('title="Search"', 'title="بحث"')
content = content.replace('aria-label="Search"', 'aria-label="بحث"')
content = content.replace('title="Compare products"', 'title="مقارنة المنتجات"')
content = content.replace('title="My Wishlist"', 'title="المفضلة"')
content = content.replace('title="Wishlist products"', 'title="المنتجات المفضلة"')
content = content.replace('title="Shopping cart"', 'title="سلة التسوق"')

# items (cart)
content = content.replace('<span data--h-bstatus="0OBSERVED">items</span>', '<span data--h-bstatus="0OBSERVED">عناصر</span>')

# Skip links
content = content.replace('Skip to navigation', 'تخطى إلى القائمة')
content = content.replace('Skip to main content', 'تخطى إلى المحتوى')

# Hero slider
content = content.replace('Charge Your Phone Safely!', 'اشحن هاتفك بأمان!')
content = content.replace('A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.', 'أجواء رائعة من السكون تغمر روحي بالكامل، مثل صباحات الربيع الجميلة التي أستمتع بها من كل قلبي.')
content = content.replace('For Everything and Everyone', 'لكل شيء وللجميع')
content = content.replace('Even if your less into design and more into content strategy you may find some redeeming value with, wait for it, dummy copy.', 'حتى لو كنت أقل اهتماماً بالتصميم وأكثر باستراتيجية المحتوى، قد تجد بعض القيمة في نسخ العرض التوضيحي.')
content = content.replace('Featured Accessories', 'إكسسوارات مميزة')
content = content.replace('A client that\u2019s unhappy for a reason is a problem, a client that\u2019s unhappy though required he or her can\u2019t quite put a finger.', 'العميل غير الراضي لسبب مشكلة، والعميل غير الراضي رغم أنه لا يستطيع تحديد السبب مشكلة أيضاً.')

# To shop / Read more buttons in slider
content = content.replace('>To shop<', '>تسوق الآن<')
content = content.replace('>Read more<', '>اقرأ المزيد<')

# Category section names
content = content.replace('aria-label="Cases"', 'aria-label="الجوالات"')
content = content.replace('aria-label="MagSafe"', 'aria-label="ماج سيف"')
content = content.replace('aria-label="Cables"', 'aria-label="الكابلات"')
content = content.replace('aria-label="Charger"', 'aria-label="الشواحن"')
content = content.replace('aria-label="Straps"', 'aria-label="الأحزمة"')
content = content.replace('aria-label="Power Banks"', 'aria-label="بطاريات خارجية"')
content = content.replace('aria-label="Product category cases"', 'aria-label="تصنيف المنتجات الجوالات"')
content = content.replace('aria-label="Product category magsafe"', 'aria-label="تصنيف المنتجات ماج سيف"')
content = content.replace('aria-label="Product category cables"', 'aria-label="تصنيف المنتجات الكابلات"')
content = content.replace('aria-label="Product category charger"', 'aria-label="تصنيف المنتجات الشواحن"')
content = content.replace('aria-label="Product category straps"', 'aria-label="تصنيف المنتجات الأحزمة"')
content = content.replace('aria-label="Product category power-banks"', 'aria-label="تصنيف المنتجات بطاريات خارجية"')

# Product counts
content = content.replace('51 products', '51 منتج')
content = content.replace('15 products', '15 منتج')
content = content.replace('18 products', '18 منتج')
content = content.replace('12 products', '12 منتج')
content = content.replace('38 products', '38 منتج')

# Section titles
content = content.replace('Hurry up to buy', 'سارع بالشراء')
content = content.replace('New Arrivals', 'وصل حديثاً')
content = content.replace('How can you evaluate content without design', 'كيف يمكنك تقييم المحتوى بدون تصميم')
content = content.replace('We Provide High Quality Goods', 'نقدم منتجات عالية الجودة')
content = content.replace('A client that\u2019s unhappy for a reason is a problem, a client that\u2019s unhappy though he or her can\u2019t', 'العميل غير الراضي لسبب هو مشكلة، والعميل غير الراضي دون سبب واضح هو مشكلة أكبر')
content = content.replace('Learn how to get a discount', 'تعلم كيف تحصل على خصم')
content = content.replace('Most Popular Products', 'المنتجات الأكثر شهرة')
content = content.replace('Proponents of content strategy may shun of dummy copy designers', 'قد يتجنب مؤيدو استراتيجية المحتوى مصممي النصوص التجريبية')

# Product tabs
content = content.replace('>CASES<', '>الجوالات<')
content = content.replace('>STRAPS<', '>الأحزمة<')
content = content.replace('>CABLES<', '>الكابلات<')
content = content.replace('>CHARGER<', '>الشواحن<')
content = content.replace('>POWER BANKS<', '>بطاريات خارجية<')

# Button text
content = content.replace('Add to cart', 'أضف للسلة')
content = content.replace('Quick view', 'عرض سريع')
content = content.replace('Add to wishlist', 'أضف للمفضلة')
content = content.replace('Compare', 'مقارنة')

# Product names
content = content.replace('iPhone 12 Pro Moment Case \u2013 Blue', 'جراب آيفون 12 برو مومنت - أزرق')
content = content.replace('Full Aquarelle iPhone XR', 'جراب أكواريلي كامل آيفون XR')
content = content.replace('iPhone 12 Pro Moment Case \u2013 Olive', 'جراب آيفون 12 برو مومنت - زيتوني')
content = content.replace('Leather Case iPhone 12 Deep Violet', 'جراب جلد آيفون 12 بنفسجي غامق')
content = content.replace('iPhone 13 Case Luxe \u2013 Dusty Pink', 'جراب آيفون 13 لوكس - وردي مغبر')
content = content.replace('iPhone 13 Case Max \u2013 Black', 'جراب آيفون 13 ماكس - أسود')
content = content.replace('iPhone 13 Case With MagSafe \u2013 Red Rose', 'جراب آيفون 13 مع ماج سيف - وردي أحمر')
content = content.replace('Epik Silicone Case Full \u2013 Lavender', 'جراب إيبك سيليكون كامل - لافندر')
content = content.replace('iPhone 12 Pro Max Silicone \u2013 Black/White', 'جراب آيفون 12 برو ماكس سيليكون - أسود/أبيض')
content = content.replace('Leather Case iPhone 11 Pro', 'جراب جلد آيفون 11 برو')

# Handle en-dash variations (some use - instead of –)
content = content.replace('iPhone 12 Pro Moment Case - Blue', 'جراب آيفون 12 برو مومنت - أزرق')
content = content.replace('iPhone 12 Pro Moment Case - Olive', 'جراب آيفون 12 برو مومنت - زيتوني')
content = content.replace('iPhone 13 Case Luxe - Dusty Pink', 'جراب آيفون 13 لوكس - وردي مغبر')
content = content.replace('iPhone 13 Case Max -  Black', 'جراب آيفون 13 ماكس - أسود')
content = content.replace('iPhone 13 Case With MagSafe - Red Rose', 'جراب آيفون 13 مع ماج سيف - وردي أحمر')
content = content.replace('Epik Silicone Case Full - Lavender', 'جراب إيبك سيليكون كامل - لافندر')
content = content.replace('iPhone 12 Pro Max Silicone - Black/White', 'جراب آيفون 12 برو ماكس سيليكون - أسود/أبيض')

# Also handle "iPhone 12 Pro Moment Case - Blue" variations (double space etc.)
# More aggressive replacements for product names with different spacing
content = content.replace('iPhone 13 Case Luxe \u2013 Dusty Pink', 'جراب آيفون 13 لوكس - وردي مغبر')

# Info boxes
content = content.replace('Fast Delivery', 'توصيل سريع')
content = content.replace('Chances are there wasn\u2019t collaboration and checkpoints, there wasn\u2019t a process.', 'على الأرجح لم يكن هناك تعاون ونقاط تفتيش، لم تكن هناك عملية منظمة.')
content = content.replace('Best Quality', 'أفضل جودة')
content = content.replace('It\u2019s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum.', 'إنها استراتيجية محتوى خاطئة منذ البداية. التخلي عن استخدام النص التجريبي.')
content = content.replace('Free Return', 'إرجاع مجاني')
content = content.replace('True enough, but that\u2019s not all that it takes to get things back on track out there for a text.', 'هذا صحيح، لكن هذا ليس كل ما يلزم لإعادة الأمور إلى مسارها الصحيح.')

# Banner texts
content = content.replace('Something completely new', 'شيء جديد تماماً')
content = content.replace('Cases for Phone', 'جوالات للهاتف')
content = content.replace('>to shop<', '>تسوق الآن<')
content = content.replace('>buy now<', '>اشتر الآن<')
content = content.replace('>read more<', '>اقرأ المزيد<')
content = content.replace('Accessories for watch', 'إكسسوارات للساعة')
content = content.replace('Straps of Any Color', 'أحزمة بأي لون')
content = content.replace('Special offer', 'عرض خاص')
content = content.replace('Buy One and Get 50% Off the Second', 'اشتري واحصل على خصم 50٪ على الثاني')
content = content.replace('Try something completely', 'جرب شيئاً جديداً كلياً')
content = content.replace('Charger Discount', 'خصم على الشواحن')

# Other banner buttons
# "to shop" in lowercase

# aria-label for Banner link
content = content.replace('aria-label="Banner link"', 'aria-label="رابط اللافتة"')

# Product category links
content = content.replace('>IPhone 12 pro<', '>آيفون 12 برو<')
# Already handled above with sub_translations

# Star rating
content = content.replace('Rated 5.00 out of 5', 'التقييم 5.00 من 5')

# "Hot" label
content = content.replace('>Hot<', '>مميز<')

# aria-labels for add to cart with product names (using the translated product names)
# These are constructed dynamically in the HTML, so we match the patterns

# aria-labels for various slider navigation
content = content.replace('aria-label="Previous slide"', 'aria-label="الشريحة السابقة"')
content = content.replace('aria-label="Next slide"', 'aria-label="الشريحة التالية"')
content = content.replace('aria-label="Go to slide 1"', 'aria-label="انتقل إلى الشريحة 1"')
content = content.replace('aria-label="Go to slide 2"', 'aria-label="انتقل إلى الشريحة 2"')
content = content.replace('aria-label="Go to slide 3"', 'aria-label="انتقل إلى الشريحة 3"')

# aria-labels for product links
content = content.replace('aria-label="Site logo"', 'aria-label="شعار الموقع"')
content = content.replace('aria-label="Main navigation"', 'aria-label="القائمة الرئيسية"')
content = content.replace('aria-label="Open mobile menu"', 'aria-label="فتح القائمة للجوال"')

# Login/Register sidebar opener title
content = content.replace('title="My account"', 'title="حسابي"')

# "View cart"
content = content.replace('"i18n_view_cart": "View cart"', '"i18n_view_cart": "عرض السلة"')

# "Show password" / "Hide password"
content = content.replace('"i18n_password_show": "Show password"', '"i18n_password_show": "إظهار كلمة المرور"')
content = content.replace('"i18n_password_hide": "Hide password"', '"i18n_password_hide": "إخفاء كلمة المرور"')

# Mobile cart title
content = content.replace('title="Shopping cart"', 'title="سلة التسوق"')

# aria-label for mobile menu
content = content.replace('aria-label="Open mobile menu"', 'aria-label="فتح القائمة للجوال"')

# Write the result
with open(r'C:\Repos\smartphone-accessories-store\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Translation complete!")
