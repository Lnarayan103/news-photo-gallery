import os
import json
import base64
import subprocess
import random

DB_FILE = 'db.json'
TEMP_IMG = 'temp_ocr_image.jpg'

PAYMENT_KEYWORDS = [
    'upi', 'payment', 'paid', 'successfully', 'transaction', 
    'paytm', 'phonepe', 'gpay', 'utr', 'ref no', 'remitter', 
    'transferred', 'inr', '₹', 'amount', 'received', 'sent'
]

PAST_DATES = [
    "March 14, 2024",
    "May 22, 2024",
    "July 8, 2024",
    "September 19, 2024",
    "November 5, 2024",
    "January 12, 2025",
    "February 28, 2025",
    "April 17, 2025",
    "June 5, 2025",
    "August 20, 2025",
    "October 11, 2025",
    "December 3, 2025"
]

def check_image_for_payment(base64_str):
    try:
        # Decode base64 to temp file
        header, encoded = base64_str.split(",", 1)
        data = base64.b64decode(encoded)
        with open(TEMP_IMG, 'wb') as f:
            f.write(data)
        
        # Run tesseract OCR
        result = subprocess.run(['tesseract', TEMP_IMG, 'stdout', '--oem', '1', '--psm', '3'], 
                               capture_output=True, text=True)
        text = result.stdout.lower()
        
        # Cleanup temp file
        if os.path.exists(TEMP_IMG):
            os.remove(TEMP_IMG)
            
        # Check if any keyword matches
        matched = []
        for word in PAYMENT_KEYWORDS:
            if word in text:
                matched.append(word)
                
        if len(matched) > 0:
            print(f"  -> MATCHED keywords: {matched}")
            return True
            
        return False
    except Exception as e:
        print("  Error running OCR:", str(e))
        if os.path.exists(TEMP_IMG):
            os.remove(TEMP_IMG)
        return False

def process_story_dates():
    if not os.path.exists(DB_FILE):
        print("db.json not found!")
        return
        
    with open(DB_FILE, 'r') as f:
        stories = json.load(f)
        
    print(f"Loaded {len(stories)} stories from database.")
    
    modified_count = 0
    skipped_payment_count = 0
    
    for idx, story in enumerate(stories):
        # We only process uploaded photos from Vandana
        if story.get('isUploaded') and story.get('photographer') == 'Vandana':
            print(f"Analyzing {idx+1}/{len(stories)}: {story['title']}")
            
            is_payment = check_image_for_payment(story['image'])
            
            if is_payment:
                # Keep date as current (e.g. June 29, 2026)
                story['date'] = "June 29, 2026"
                skipped_payment_count += 1
                print(f"  Status: UPI Payment Screenshot -> Kept current date: {story['date']}")
            else:
                # Backdate to a random past date in 2024 or 2025
                old_date = story['date']
                new_date = random.choice(PAST_DATES)
                story['date'] = new_date
                modified_count += 1
                print(f"  Status: Standard Photo -> Backdated from '{old_date}' to '{new_date}'")
                
    # Save back to db.json
    with open(DB_FILE, 'w') as f:
        json.dump(stories, f, indent=2)
        
    print("\n--- Summary ---")
    print(f"Total Modified (Backdated): {modified_count}")
    print(f"Total Skipped (UPI Screenshots Kept Current): {skipped_payment_count}")

if __name__ == "__main__":
    process_story_dates()
