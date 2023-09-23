export const GET_USER = `
    select * from users
    where id = ?
    limit 1
  `;

export const CREATE_USER = `insert into users (id, email, ethAddress) values (?, ?, ?)`;

export const SET_EMAIL_ADDRESS = `update users set email = ? where id = ?`;

export const SET_PRIMARY_SHIPPING = `
    update users 
    set shippingAddressLine1 = ?, shippingAddressLine2  = ?, shippingCity  = ?, shippingState  = ?, shippingCountry  = ?, shippingZipCode = ?, updatedAt = ? 
    where id = ?
  `;

export const SET_PRIMARY_SECONDARY_PHONE = `
    update users 
    set primaryPhoneNumber = ?, secondaryPhoneNumber = ?, updatedAt = ? 
    where id = ?
  `;

export const SET_LOCATION = `
    update users 
    set location = ?, updatedAt = ? 
    where id = ?
  `;

export const SET_MAIN_INFO = `
    update users 
    set firstName = ?, lastName  = ?, displayName = ?, ethAddress = ?, updatedAt = ? 
    where id = ?
  `;

export const SET_AVATAR_URL = `
    update users 
    set avatarUrl = ? 
    where id = ?
  `;

export const SET_OPT_IN = `
    update users 
    set email = ?, optedIn = ?, digitalPrizes = ?, updatedAt = ? 
    where id = ?
  `;

export const SET_OPT_OUT = `
    update users 
    set optedIn = ?, updatedAt = ? 
    where id = ?
  `;
