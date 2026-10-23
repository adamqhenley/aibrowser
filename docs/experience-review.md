# First live experience review

The first account-backed result correctly honored records-first, summary-last, compact dark cards. It preserved source content. The surrounding interface was too prominent: repeated source buttons competed with content, connection settings displaced the task prompt, and successive requests had no layout context.

This iteration adds a collapsed account section, a smaller page label, source controls on demand, a short layout explanation, and in-memory undo/redo for up to 20 layouts. Follow-up requests include the current validated plan so unchanged choices can carry forward. Content updates with compatible block IDs retain the current presentation; navigation clears layout history. No additional AI call is needed for undo or redo.

The renderer remains a bounded presentation engine: ordering, cards/list/reader, density, and theme. It cannot yet summarize, compare extracted attributes, fact-check, or execute publisher capabilities. Prompt instructions explicitly require acknowledging those limits. Original text stays visible and source anchors remain available.

Next evaluation should use realistic long-form and comparison content. Measure whether a reader finds a named fact faster, can compare alternatives without manual tab switching, and can distinguish publisher content from assistant interpretation. Any future summary or comparison must have its own labeled, cited output contract rather than silently changing publisher blocks.
