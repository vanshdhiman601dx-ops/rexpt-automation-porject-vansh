# Automation Plan

## Module 1: Authentication (Login)

### Objective

The first automation milestone is to implement the Login module of the Rexpt Web Application using Playwright with JavaScript. The scope of this phase is limited to the Authentication screen only. Post-login application functionalities are intentionally excluded from this implementation.

---

## Scope

### Included

* Login page automation
* Login validation scenarios
* OTP-based login
* Google Login
* UI validation of the Login screen
* Negative test scenarios
* Positive login flow

### Excluded

* User Signup
* Onboarding Flow
* Dashboard automation
* Any functionality after successful login
* Apple Login (Not supported on the current Windows development environment)

---

# Authentication Flow Design

Although Signup automation cannot be implemented at this stage because it redirects users to the onboarding process, the framework should be designed in a modular way so that Signup can be integrated later without affecting the existing Login automation.

### Planned Authentication Structure

```
Authentication

├── Signup (Placeholder - Future Implementation)
├── Login with OTP
├── Login with Google
└── Login with Apple (Future / Disabled)
```

The Signup module will remain as a placeholder during the initial implementation and will be completed in a future phase.

---

# Login Automation Flow

The Login module will follow the sequence below:

```
Launch Browser

↓

Open Rexpt Web Application

↓

Navigate to Login Screen

↓

Execute All Negative Test Scenarios

↓

Verify Validation Messages

↓

Verify UI Behaviour

↓

Execute Positive Login

↓

OTP Verification

↓

Login Successful
```

The automation must execute all planned negative scenarios before performing the final successful login. This ensures that all validations are verified without requiring multiple independent executions.

---

# Login Strategy

The Login module will follow the strategy below:

1. Launch the application.
2. Open the Login screen.
3. Execute all planned negative scenarios.
4. Verify all expected validation messages.
5. Verify UI behaviour and input validations.
6. Execute one final positive login.
7. Complete OTP verification.
8. End the execution after successful login.

No post-login validations are included in this phase.

---

# Future Expandability

The Authentication module is intentionally designed to be modular.

When Signup automation becomes feasible, the placeholder can be replaced with a complete Signup and Onboarding implementation without modifying the existing Login automation.

---
Module: Onboarding Automation Execution Flow (Post Signup)
Objective
This document defines the execution strategy for automating the Rexpt onboarding flow after a successful Signup and OTP verification. The objective is not only to validate the onboarding screens but also to verify the application's Resume Setup functionality by simulating real user behavior where the application is closed during onboarding and resumed later.

Scope
Included
Onboarding screens under /business-step
Negative validation testing
Positive flow execution
Resume Setup validation
Browser close and relaunch scenarios
Recovery mechanism after resume failures
Excluded
Signup
Personal Details page (handled separately)
Post-onboarding dashboard testing
Agent functionality

Onboarding URLs & Screens
The following onboarding flow is applicable only to the /business-step URL.
URL
Screen
/business-step
Business Category
/business-step
Business Details
/business-step
Business Listing
/business-step
Your AI Sounds

At any point, only one onboarding screen is visible. The active screen will be identified using the bold heading displayed on the page, not by the URL alone.

Navigation Rules
Initially, users can move to the next screen only by clicking the Continue button.
Continue becomes functional only after valid input is provided.
Navigation dots are not used as the primary navigation mechanism and are ignored for automation.

Runtime Lists
The automation maintains three runtime lists during execution.
1. Master Onboarding Flow List (Static)
Stores the complete onboarding sequence.
Example:
[
  { url: "/business-step", screen: "Business Category" },
  { url: "/business-step", screen: "Business Details" },
  { url: "/business-step", screen: "Business Listing" },
  { url: "/business-step", screen: "Your AI Sounds" }
]
Purpose:
Defines the onboarding sequence.
Determines the next expected screen after clicking Continue.

2. Tested Screens List (Dynamic)
Initially empty.
Stores all onboarding screens whose negative testing has been completed successfully.
Example:
[
  { url: "/business-step", screen: "Business Category" },
  { url: "/business-step", screen: "Business Details" }
]
Purpose:
Prevent duplicate execution of negative test cases.
If a screen already exists in this list, only positive data entry is performed.

3. Expected Resume Screen (Dynamic)
Stores only one record.
Example:
{
    url: "/business-step",
    screen: "Business Details"
}
Purpose:
Represents the screen where the application is expected to resume after reopening and clicking Continue Setup.

Standard Execution Flow
Each onboarding screen follows the same execution strategy.
Detect current URL and screen.
Verify current screen heading.
Execute all negative test cases for the screen.
Add the current screen to the Tested Screens List.
Enter valid input.
Click Continue.
Store the next onboarding screen as the Expected Resume Screen.
Close the browser.

Resume Validation Flow
After closing the browser:
Launch the application.
Login if required.
Navigate to /fast-agent-detail.
Verify the DRAFT AGENT card is present.
Click Continue Setup.
Read the current URL and current screen heading.
Compare both values with the Expected Resume Screen.

Resume Validation Result
Scenario 1 — Resume Successful
If URL and screen match the Expected Resume Screen:
Resume validation passes.
Enter valid data.
Click Continue.
Store the next expected resume screen.
Continue with the remaining onboarding screens.

Scenario 2 — Resume Failed
If URL or screen does not match:
Record the failure.
Continue execution inside a try-catch block.
Do not stop the test suite.
Accept the screen where the application actually opened.
Recovery flow:
Check the Tested Screens List.
If the current screen already exists:
Skip all negative test cases.
Enter valid data.
Click Continue.
Continue moving through the onboarding flow until reaching an untested screen.
Resume normal negative testing from that screen onward.
This approach ensures that a Resume Setup defect does not prevent the execution of the remaining onboarding tests.

Tested Screen Handling
A screen is added to the Tested Screens List only after all planned negative test cases for that screen have been completed.
If execution returns to an already tested screen because of a Resume Setup issue:
Negative test cases must not be executed again.
The automation enters valid data.
Clicks Continue.
Moves to the next screen.
This prevents duplicate testing and reduces unnecessary execution time.

Final Onboarding Screen Exception
The Resume Setup validation flow applies only to the onboarding screens under the /business-step URL.
The last onboarding screen is:
Your AI Sounds
After entering valid data and clicking Finish:
Onboarding is completed.
The browser may be closed.
When the application is reopened:
The user must not be redirected back to onboarding.
The user should be redirected to /fast-agent-detail.
The agent should already be created.
The Resume Setup validation flow ends after the Your AI Sounds screen.

Execution Summary
Signup
↓

OTP Verification
↓

Business Category
│
├── Negative Testing
├── Positive Input
├── Continue
├── Save Expected Resume Screen
└── Close Browser
        │
        ▼
Launch Application
↓

/fast-agent-detail

↓

DRAFT AGENT

↓

Continue Setup

↓

Compare Current URL + Screen
with Expected Resume Screen

├── Match
│      ↓
│   Positive Input
│      ↓
│   Continue
│
└── Mismatch
       ↓
Record Failure
       ↓
Check Tested Screens List
       ↓
Already Tested?
       │
   Yes ──► Positive Input → Continue
       │
   No ───► Execute Negative Tests → Positive Input → Continue

↓

Repeat for:
Business Details

↓

Business Listing

↓

Your AI Sounds

↓

Finish

↓

Close Browser

↓

Launch Application

↓

/fast-agent-detail

↓

Verify Agent Created

↓

End of Onboarding Automation
This execution strategy ensures that:
Every onboarding screen is negatively tested exactly once.
Resume functionality is validated after each transition between onboarding screens.
Resume failures do not interrupt the remaining test execution.
The final onboarding completion behavior is validated separately from the Resume Setup flow.

