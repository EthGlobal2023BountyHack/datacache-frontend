# Mandatory changes in Shopify

We do these actions to show correct information about your store

## Steps:

1. From the Shopify admin, go to **Settings > Notifications**.
2. In the **Customers notifications** section, click the **Customer account welcome** email template.
3. In the template editor, update the **storefront link** to point to our storefront's account activation page.

Pass the new URL instead of URL `http://localhost:3000` by replacing to your store domain in two places. For example:

Before:

```html
<h1 class="shop-name__text">
  <a href="http://localhost:3000/info/account-activated">{{ shop.name }}</a>
</h1>
```

```html
<td class="button__cell">
  <a href="http://localhost:3000/info/account-activated" class="button__text">Visit our store</a>
</td>
```

After:

```html
<h1 class="shop-name__text">
  <a href="https://www.my-app-domain.com/info/account-activated">{{ shop.name }}</a>
</h1>
```

```html
<td class="button__cell">
  <a href="https://www.my-app-domain.com/info/account-activated" class="button__text">Visit our store</a>
</td>
```

4. Save changes and return back to the **Notifications** block.
5. In the **Customers notifications** section, click the **Customer account password reset** email template.

Pass the new URL instead of URL `http://localhost:3000` by replacing to your store domain in four places. For example:

Before:

```html
{% capture email_body %}Follow this link to reset your customer account password at
<a href="http://localhost:3000/">{{shop.name}}</a>. If you didn't request a new password, you can safely delete this
email.{% endcapture %}
```

```html
<h1 class="shop-name__text">
  <a href="http://localhost:3000/">{{ shop.name }}</a>
</h1>
```

```html
<td class="button__cell">
  <a href="http://localhost:3000/password-recovery?recoveryUrl={{ customer.reset_password_url }}" class="button__text"
    >Reset your password</a
  >
</td>
```

```html
<tr>
  <td class="link__cell">or <a href="http://localhost:3000/">Visit our store</a></td>
</tr>
```

After:

```html
{% capture email_body %}Follow this link to reset your customer account password at
<a href="https://www.my-app-domain.com/">{{shop.name}}</a>. If you didn't request a new password, you can safely delete
this email.{% endcapture %}
```

```html
<h1 class="shop-name__text">
  <a href="https://www.my-app-domain.com/">{{ shop.name }}</a>
</h1>
```

```html
<td class="button__cell">
  <a
    href="https://www.my-app-domain.com/password-recovery?recoveryUrl={{ customer.reset_password_url }}"
    class="button__text"
    >Reset your password</a
  >
</td>
```

```html
<tr>
  <td class="link__cell">or <a href="https://www.my-app-domain.com/">Visit our store</a></td>
</tr>
```
