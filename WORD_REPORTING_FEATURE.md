# Word Translation Reporting Feature

## Overview

This feature allows users to report incorrect word translations directly from the typing interface. When users encounter inaccurate translations, they can easily submit corrections that are stored locally and automatically reported to maintainers when enough reports are collected.

## How It Works

### 1. Reporting Individual Words

- When hovering over a word translation, a flag icon (🏁) appears next to the translation
- Clicking the flag icon opens a modal where users can:
  - View the current word and its translation
  - Enter the correct translation
  - Submit the report

### 2. Local Storage

- Each reported word is stored locally with:
  - Word name
  - Original translation
  - User's correction
  - Dictionary name
  - Timestamp

### 3. Batch Reporting

- When 10 words are reported, a summary modal automatically appears
- Users can review all reported words before submitting
- Clicking "Report to Maintainer" opens a pre-filled Google Form
- After submission, reported words are moved to history and the pending list is cleared

### 4. Google Forms Integration

- Reports are submitted via: `https://docs.google.com/forms/d/e/1FAIpQLSdZSLMMw5lGL0NJb8bNeMsEwBQ0H3aEUkTtmt0cmVOV9c8QgA/viewform`
- The form is pre-filled with all reported words in a structured format
- Each word includes: original translation → corrected translation (dictionary name)

## Technical Implementation

### Components Created

1. **ReportTranslationModal** (`/src/components/ReportTranslationModal/index.tsx`)

   - Modal for reporting individual word translation issues
   - Form validation and submission handling

2. **ReportSummaryModal** (`/src/components/ReportSummaryModal/index.tsx`)
   - Modal for reviewing and submitting batch reports
   - Integration with Google Forms

### Utilities

3. **reportedWords.ts** (`/src/utils/reportedWords.ts`)
   - Local storage management functions
   - Google Forms URL generation
   - Word formatting utilities

### Modified Components

4. **Translation Component** (`/src/pages/Typing/components/WordPanel/components/Translation/index.tsx`)

   - Added report button that appears on hover
   - New props for word reporting functionality

5. **WordPanel Component** (`/src/pages/Typing/components/WordPanel/index.tsx`)
   - Integration of reporting modals
   - State management for reporting flow
   - Auto-trigger of summary modal when 10 words are reached

### Type Definitions

6. **Types** (`/src/typings/index.ts`)

   ```typescript
   export type ReportedWord = {
     word: string
     originalTranslation: string
     userCorrection: string
     dictionary: string
     timestamp: number
   }

   export type ReportedWordsHistory = {
     pending: ReportedWord[]
     submitted: ReportedWord[][]
   }
   ```

### Internationalization

7. **Translation Keys** (Added to both `/src/locales/en/translation.json` and `/src/locales/zh/translation.json`)
   - Complete translation support for English and Chinese
   - All UI text is properly internationalized

## Local Storage Structure

```javascript
// Key: 'qwerty_reported_words'
{
  "pending": [
    {
      "word": "example",
      "originalTranslation": "错误翻译",
      "userCorrection": "正确翻译",
      "dictionary": "CET-4",
      "timestamp": 1641024000000
    }
  ],
  "submitted": [
    [/* previous batch of 10 words */],
    [/* another batch of 10 words */]
  ]
}
```

## User Experience Flow

1. User encounters incorrect translation while typing
2. User hovers over translation → report flag appears
3. User clicks flag → report modal opens
4. User enters correct translation and submits
5. Word is stored locally (user gets feedback)
6. When 10 words accumulated → summary modal automatically appears
7. User reviews all words and clicks "Report to Maintainer"
8. Google Form opens in new tab with pre-filled data
9. Reported words move to history, pending list clears
10. Process repeats for next batch

## Features

- ✅ Hover-activated report button
- ✅ Individual word reporting modal
- ✅ Local storage persistence
- ✅ Automatic batch collection (10 words)
- ✅ Summary modal with review capability
- ✅ Google Forms integration with pre-filled data
- ✅ History tracking of submitted reports
- ✅ Full internationalization (English/Chinese)
- ✅ Responsive design with dark mode support
- ✅ Proper error handling and validation
- ✅ TypeScript type safety

## Benefits

- **For Users**: Easy way to contribute to translation quality
- **For Maintainers**: Structured feedback collection via Google Forms
- **For Community**: Improved translation accuracy over time
- **For Project**: Better user engagement and data quality
