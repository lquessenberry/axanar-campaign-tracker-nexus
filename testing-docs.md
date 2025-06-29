# Testing Documentation for Axanar Campaign Tracker Nexus

## Playwright E2E Testing

This project uses Playwright for end-to-end testing of the application. These tests ensure that the application works as expected from a user's perspective.

### Setup

1. Playwright is already installed as a dev dependency in this project.
2. Test files are located in the `tests/` directory.

### Configuration

- The Playwright configuration is in `playwright.config.ts` in the root directory.
- Tests are configured to run against your local development server.
- By default, tests will run in Chromium, Firefox, and WebKit browsers.

### Environment Variables for Testing

Create a `.env.test` file in the project root with the following variables:

```
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
DEFAULT_CAMPAIGN_ID=your-default-campaign-id
```

Note: `.env.test` is included in `.gitignore` and should not be committed to the repository.

### Creating Test Donors

To populate the database with test donor accounts, run:

```bash
npm run create-spoof-donors
```

This will create 5 test donor accounts with the following emails:
- lquessenberry+spoof1@gmail.com
- lquessenberry+spoof2@gmail.com
- lquessenberry+spoof3@gmail.com
- lquessenberry+spoof4@gmail.com
- lquessenberry+spoof5@gmail.com

### Running Tests

Run all Playwright tests:

```bash
npm test
```

Run tests with UI mode:

```bash
npm run test:ui
```

Run tests in debug mode:

```bash
npm run test:debug
```

### Test Structure

1. **Admin Dashboard Tests**: Verify the unified dashboard functionality
   - Navigation between sections
   - Display of data
   - UI components

2. **Donor Management Tests**: Test donor CRUD operations
   - Listing donors
   - Searching/filtering
   - Editing donor details
   - Bulk actions

3. More test categories will be added as development continues

### Best Practices

1. **Incremental Testing**: Write small, focused tests as features are developed
2. **Trust but Verify**: Write tests to confirm that features work as expected
3. **Isolate Tests**: Each test should be independent of others
4. **Realistic Data**: Use realistic test data that mimics production scenarios
5. **Maintainable Tests**: Keep tests simple and focused on behavior, not implementation details

### CI/CD Integration 

When setting up CI/CD:
1. Ensure the Playwright browser dependencies are installed
2. Set up appropriate environment variables for CI testing
3. Add a test step to your pipeline to run `npm test`
