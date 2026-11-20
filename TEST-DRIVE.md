# Test-drive requests

The test-drive page keeps its vehicle imagery, brand selection, model cards, preferred showroom, calendar, contact preferences and review stage. Inputs, choices, validation, conditional visibility and submission settings come from the live Wix form schema.

Form ID: `6fb28204-5ca5-4047-a323-8eabc0730ef5`.

Submissions: https://manage.wix.com/dashboard/7f793d65-03fd-425a-a784-58a0d3f114f0/wix-forms/form/6fb28204-5ca5-4047-a323-8eabc0730ef5/submissions

A submitted request does not reserve a vehicle or appointment. The Unicars team must confirm it. Model/stock entry points preselect the precise vehicle when it remains an allowed live form choice. Switching brands clears hidden model/showroom choices. Phone is required when the visitor asks for a call; contact consent is required. Dates follow the schema’s rolling future-date bounds.

The current regression suite checks the live-schema snapshot, brand rules, field changes, route prefills, review validation, visitor transport and failure handling. Browser visual QA remains unavailable. Do not reintroduce the former local-only preview completion.
