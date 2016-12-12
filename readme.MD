Nightwatch XHR
===

We've encountered some issues with our e2e tests.
We tried checking if clicks on specific links behave as they should (which also meant, send a POST XHR request to a tracking server).

Since we couldn't find any package for that, we wrote one.

So - this package waits for XHR to complete and enables a callback with its values for assertion.

Have fun!

Install
---
```javascript
npm install nightwatch-xhr
```

Usage Example
---

Contribute
---
Feel free to correct/improve the code and send in a pull request!
