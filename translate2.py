import re

with open(r'C:\Repos\smartphone-accessories-store\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_text(content, old, new):
    """Replace text that might have whitespace/newlines between words"""
    pattern = re.escape(old)
    pattern = pattern.replace(r'\ ', r'\s+')
    return re.sub(pattern, new, content, flags=re.DOTALL)

# Hero slider texts (split across lines with whitespace)
content = replace_text(content, 'Charge Your Phone Safely!', 'اشحن هاتفك بأمان!')
content = replace_text(content, 'A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.', 'أجواء رائعة من السكون تغمر روحي بالكامل، مثل صباحات الربيع الجميلة التي أستمتع بها من كل قلبي.')
content = replace_text(content, 'For Everything and Everyone', 'لكل شيء وللجميع')
content = replace_text(content, 'Even if your less into design and more into content strategy you may find some redeeming value with, wait for it, dummy copy.', 'حتى لو كنت أقل اهتماماً بالتصميم وأكثر باستراتيجية المحتوى، قد تجد بعض القيمة في نسخ العرض التوضيحي.')
content = replace_text(content, 'Featured Accessories', 'إكسسوارات مميزة')
content = replace_text(content, 'A client that\u2019s unhappy for a reason is a problem, a client that\u2019s unhappy though required he or her can\u2019t quite put a finger.', 'العميل غير الراضي لسبب مشكلة، والعميل غير الراضي رغم أنه لا يستطيع تحديد السبب مشكلة أيضاً.')

# Also handle the other version of the text
content = replace_text(content, "A client that's unhappy for a reason is a problem, a client that's unhappy though required he or her can't quite put a finger.", 'العميل غير الراضي لسبب مشكلة، والعميل غير الراضي رغم أنه لا يستطيع تحديد السبب مشكلة أيضاً.')

# "To shop" and "Read more" in buttons (split across lines)
# Match: >\s*To\s+shop\s*<
content = re.sub(r'>\s*To\s+shop\s*<', '>تسوق الآن<', content, flags=re.DOTALL)
content = re.sub(r'>\s*Read\s+more\s*<', '>اقرأ المزيد<', content, flags=re.DOTALL)
# Also handle lowercase versions
content = re.sub(r'>\s*to\s+shop\s*<', '>تسوق الآن<', content, flags=re.DOTALL)
content = re.sub(r'>\s*read\s+more\s*<', '>اقرأ المزيد<', content, flags=re.DOTALL)
content = re.sub(r'>\s*buy\s+now\s*<', '>اشتر الآن<', content, flags=re.DOTALL)

# Remaining section texts that might be split across lines
content = replace_text(content, 'Hurry up to buy', 'سارع بالشراء')
content = replace_text(content, 'How can you evaluate content without design', 'كيف يمكنك تقييم المحتوى بدون تصميم')
content = replace_text(content, 'Learn how to get a discount', 'تعلم كيف تحصل على خصم')
content = replace_text(content, 'Most Popular Products', 'المنتجات الأكثر شهرة')
content = replace_text(content, 'Proponents of content strategy may shun of dummy copy designers', 'قد يتجنب مؤيدو استراتيجية المحتوى مصممي النصوص التجريبية')

# Info box texts (split across lines)
content = replace_text(content, 'Fast Delivery', 'توصيل سريع')
content = replace_text(content, "Chances are there wasn\u2019t collaboration and checkpoints, there wasn\u2019t a process.", 'على الأرجح لم يكن هناك تعاون ونقاط تفتيش، لم تكن هناك عملية منظمة.')
content = replace_text(content, 'Best Quality', 'أفضل جودة')
content = replace_text(content, "It\u2019s content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum.", 'إنها استراتيجية محتوى خاطئة منذ البداية. التخلي عن استخدام النص التجريبي.')
content = replace_text(content, 'Free Return', 'إرجاع مجاني')
content = replace_text(content, "True enough, but that\u2019s not all that it takes to get things back on track out there for a text.", 'هذا صحيح، لكن هذا ليس كل ما يلزم لإعادة الأمور إلى مسارها الصحيح.')

# Also handle plain apostrophe versions
content = replace_text(content, "Chances are there wasn't collaboration and checkpoints, there wasn't a process.", 'على الأرجح لم يكن هناك تعاون ونقاط تفتيش، لم تكن هناك عملية منظمة.')
content = replace_text(content, "It's content strategy gone awry right from the start. Forswearing the use of Lorem Ipsum.", 'إنها استراتيجية محتوى خاطئة منذ البداية. التخلي عن استخدام النص التجريبي.')
content = replace_text(content, "True enough, but that's not all that it takes to get things back on track out there for a text.", 'هذا صحيح، لكن هذا ليس كل ما يلزم لإعادة الأمور إلى مسارها الصحيح.')

# Banner texts (split across lines)
content = replace_text(content, 'Something completely new', 'شيء جديد تماماً')
content = replace_text(content, 'Cases for Phone', 'جوالات للهاتف')
content = replace_text(content, 'Accessories for watch', 'إكسسوارات للساعة')
content = replace_text(content, 'Straps of Any Color', 'أحزمة بأي لون')
content = replace_text(content, 'Special offer', 'عرض خاص')
content = replace_text(content, 'Buy One and Get 50% Off the Second', 'اشتري واحصل على خصم 50٪ على الثاني')
content = replace_text(content, 'Try something completely', 'جرب شيئاً جديداً كلياً')
content = replace_text(content, 'Charger Discount', 'خصم على الشواحن')

# Section subtitle
content = replace_text(content, 'We Provide High Quality Goods', 'نقدم منتجات عالية الجودة')
content = replace_text(content, "There are some redeeming factors", 'هناك بعض العوامل المميزة')

# Star rating
content = replace_text(content, 'Rated 5.00 out of 5', 'التقييم 5.00 من 5')

# "Hot" label
content = re.sub(r'>\s*Hot\s*<', '>مميز<', content, flags=re.DOTALL)

# Aria labels for add to cart (these are on single lines)
# These are already translated via the product name replacements in step 1
# But let's also handle the remaining untranslated ones with regex

# Handle "New Arrivals" 
content = replace_text(content, 'New Arrivals', 'وصل حديثاً')

# Handle aria-labels for Go to slide (already done via simple replace)

# Handle "iPhone Leather Wallet Black" etc. that don't have translations specified
# These are product names in the popular products section

# Write the result
with open(r'C:\Repos\smartphone-accessories-store\index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Enhanced translation complete!")
