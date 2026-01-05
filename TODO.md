# UPS - TODO & Future Work

## Known Issues

- [ ] **Explainer not used**: The `explainer.ts` module exists but isn't called in the current flow (we use pre-written content instead). Decide: remove or make optional.
- [ ] **InteractiveResult hardcodes season scores**: The quick-nav buttons use hardcoded score values for each season. Should derive from classify function.

## Immediate TODOs

- [ ] Add OPENROUTER_API_KEY validation on server startup
- [ ] Add rate limiting to API endpoint
- [ ] Test with real images (requires API key)
- [ ] Run content generator and verify output quality

## Future Enhancements

### Content Generation
- [ ] Generate more Barnum statement variations
- [ ] Add dimension-specific insights (high warmth = "...", low warmth = "...")
- [ ] Export generated content to TypeScript for type safety

### UI/UX
- [ ] Add share button (generate image card)
- [ ] Add test selector (when we have multiple tests)
- [ ] Mobile camera integration testing
- [ ] Loading skeleton for better perceived performance

### Testing
- [ ] E2E tests with Playwright
- [ ] VLM response mocking for integration tests
- [ ] Snapshot tests for generated content

### DevOps
- [ ] Docker deployment config
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment variable validation

## Technical Debt

- [ ] The `ResultCard.tsx` component is unused (replaced by `InteractiveResult.tsx`). Consider removing.
- [ ] Consolidate test exports (currently exports both `tests` object and individual test)

## Questions to Resolve

1. Should the explainer VLM call be optional/lazy (only if user requests it)?
2. Do we want to support multiple tests at once, or just one per deployment?
3. Should generated content be version-controlled or .gitignored?
