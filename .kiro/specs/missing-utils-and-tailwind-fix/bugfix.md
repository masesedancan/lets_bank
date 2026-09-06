# Bugfix Requirements Document

## Introduction

The application build is completely broken due to two critical bugs that prevent compilation and CSS generation. The first bug involves missing utility function implementations in `lib/utils.ts` that are imported by 20+ components and action files throughout the codebase. The second bug is a Tailwind CSS configuration error that causes the CSS compiler to crash during the build process. These bugs make the application completely non-functional and must be fixed to restore basic build and runtime functionality.

## Bug Analysis

### Current Behavior (Defect)

**Bug 1: Missing Utility Function Implementations**

1.1 WHEN any component imports `parseStringify` from `@/lib/utils` THEN the build fails with "Export 'parseStringify' doesn't exist in target module" error

1.2 WHEN any component imports `extractCustomerIdFromUrl` from `@/lib/utils` THEN the build fails with "Export 'extractCustomerIdFromUrl' doesn't exist in target module" error

1.3 WHEN any component imports `encryptId` from `@/lib/utils` THEN the build fails with "Export 'encryptId' doesn't exist in target module" error

1.4 WHEN any component imports `decryptId` from `@/lib/utils` THEN the build fails with "Export 'decryptId' doesn't exist in target module" error

1.5 WHEN any component imports `formUrlQuery` from `@/lib/utils` THEN the build fails with "Export 'formUrlQuery' doesn't exist in target module" error

1.6 WHEN any component imports `formatAmount` from `@/lib/utils` THEN the build fails with "Export 'formatAmount' doesn't exist in target module" error

1.7 WHEN any component imports `formatDateTime` from `@/lib/utils` THEN the build fails with "Export 'formatDateTime' doesn't exist in target module" error

1.8 WHEN any component imports `getAccountTypeColors` from `@/lib/utils` THEN the build fails with "Export 'getAccountTypeColors' doesn't exist in target module" error

1.9 WHEN any component imports `getTransactionStatus` from `@/lib/utils` THEN the build fails with "Export 'getTransactionStatus' doesn't exist in target module" error

1.10 WHEN any component imports `removeSpecialCharacters` from `@/lib/utils` THEN the build fails with "Export 'removeSpecialCharacters' doesn't exist in target module" error

1.11 WHEN any component imports `countTransactionCategories` from `@/lib/utils` THEN the build fails with "Export 'countTransactionCategories' doesn't exist in target module" error

1.12 WHEN any component imports `authFormSchema` from `@/lib/utils` THEN the build fails with "Export 'authFormSchema' doesn't exist in target module" error

**Bug 2: Tailwind Configuration Type Error**

1.13 WHEN the build process attempts to compile Tailwind CSS with `tailwind.config.ts` using `satisfies Config` syntax THEN Tailwind v3 crashes with "Cannot read properties of undefined (reading 'raws')" error in generateRules.js

1.14 WHEN the Tailwind CSS compiler crashes THEN the entire build process fails and no CSS is generated

### Expected Behavior (Correct)

**Bug 1: Utility Functions Should Be Implemented**

2.1 WHEN any component imports `parseStringify` from `@/lib/utils` THEN the system SHALL provide a valid implementation that converts objects to JSON and back to plain objects

2.2 WHEN any component imports `extractCustomerIdFromUrl` from `@/lib/utils` THEN the system SHALL provide a valid implementation that extracts customer ID from URL parameters

2.3 WHEN any component imports `encryptId` from `@/lib/utils` THEN the system SHALL provide a valid implementation that encrypts an ID string for secure transmission

2.4 WHEN any component imports `decryptId` from `@/lib/utils` THEN the system SHALL provide a valid implementation that decrypts an encrypted ID string

2.5 WHEN any component imports `formUrlQuery` from `@/lib/utils` THEN the system SHALL provide a valid implementation that constructs URL query strings from parameters

2.6 WHEN any component imports `formatAmount` from `@/lib/utils` THEN the system SHALL provide a valid implementation that formats numeric amounts as currency strings

2.7 WHEN any component imports `formatDateTime` from `@/lib/utils` THEN the system SHALL provide a valid implementation that formats dates and times for display

2.8 WHEN any component imports `getAccountTypeColors` from `@/lib/utils` THEN the system SHALL provide a valid implementation that returns color values based on account type

2.9 WHEN any component imports `getTransactionStatus` from `@/lib/utils` THEN the system SHALL provide a valid implementation that determines transaction status from transaction data

2.10 WHEN any component imports `removeSpecialCharacters` from `@/lib/utils` THEN the system SHALL provide a valid implementation that strips special characters from strings

2.11 WHEN any component imports `countTransactionCategories` from `@/lib/utils` THEN the system SHALL provide a valid implementation that aggregates transaction counts by category

2.12 WHEN any component imports `authFormSchema` from `@/lib/utils` THEN the system SHALL provide a valid Zod schema factory function for authentication form validation

**Bug 2: Tailwind Configuration Should Use Compatible Syntax**

2.13 WHEN the build process compiles Tailwind CSS with `tailwind.config.ts` THEN the system SHALL use type assertion syntax (`as Config`) instead of `satisfies Config` to ensure compatibility with Tailwind v3

2.14 WHEN Tailwind CSS compiles successfully THEN the system SHALL generate all CSS styles without runtime errors and the build process SHALL complete successfully

### Unchanged Behavior (Regression Prevention)

3.1 WHEN any component imports the existing `cn` utility function from `@/lib/utils` THEN the system SHALL CONTINUE TO provide the class name merging functionality using clsx and tailwind-merge

3.2 WHEN Tailwind CSS compiles the theme configuration including custom colors, fontSize, backgroundImage, boxShadow, and other extensions THEN the system SHALL CONTINUE TO generate all custom utility classes correctly

3.3 WHEN Tailwind CSS applies the darkMode class strategy THEN the system SHALL CONTINUE TO support dark mode toggling via the "class" attribute

3.4 WHEN Tailwind CSS processes content from pages, components, app, and constants directories THEN the system SHALL CONTINUE TO scan and include all utility classes used in those files

3.5 WHEN the tailwindcss-animate plugin is applied THEN the system SHALL CONTINUE TO provide accordion animations and other animation utilities
