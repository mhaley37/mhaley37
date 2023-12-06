# MAINTENANCE REQUEST

```
Environment ... ldx-prod (DI)
Product ....... Lighthouse Hub
Start ......... __proposed_start_date_time__ ET
End ........... __proposed_end_date_time__ ET
```

**SLA OR PERFORMANCE IMPACTS**
- N/A

**WHAT MAINTAINERS SEE NOW VS AFTER**
- This application uses a CalVer scheme; updating web application from version __OLD_VERSION__ to version V

**WHAT USERS SEE NOW VS AFTER**
- Detailed changes included in release are listed in [__NEW_VERSION__ release notes](https://github.com/department-of-veterans-affairs/lighthouse-developer-portal/releases/tag/__NEW_VERSION__)

**DEPLOYMENT PROCEDURE**
1. Trigger the CD workflow, targeting the Prod environment, by updating the existing Sandbox pre-release
    - Detailed by [Release to Production Environment](https://github.com/department-of-veterans-affairs/lighthouse-developer-portal/blob/main/docs/Deploy-Release/production-release.md) instructions

**POST-DEPLOYMENT VERIFICATION**
- E2E browser & integration tests are run immediately following every release, against the newly deployed environment, to verify its behavior

**ROLLBACK PROCEDURE**
1. Rollback to the previous version of the app using the Helm CLI:
```sh
helm rollback lighthouse-developer-portal-prod
```
