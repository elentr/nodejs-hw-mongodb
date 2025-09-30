import { Contact } from '../db/models/contacts.js';

export const getAllContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};

export const getContactById = async contactId => {
  const contact = await Contact.findById(contactId);
  return contact;
};

export const createContact = async payload => {
  const { name, phoneNumber, email, isFavourite, contactType } = payload;
  if (!name || !phoneNumber || !contactType) {
    throw new Error('Name, phoneNumber, and contactType are required');
  }

  const contact = await Contact.create({
    name,
    phoneNumber,
    email,
    isFavourite: isFavourite || false,
    contactType,
  });
  return contact;
};

export const updateContact = async (contactId, payload) => {
  const { name, phoneNumber, contactType } = payload;
  if (
    name === '' ||
    phoneNumber === '' ||
    (contactType && !['work', 'home', 'personal'].includes(contactType))
  ) {
    throw new Error('Invalid input data');
  }

  const contact = await Contact.findByIdAndUpdate(contactId, payload, {
    new: true,
    runValidators: true, // валідація схеми
  });
  return contact;
};

export const deleteContact = async contactId => {
  const contact = await Contact.findByIdAndDelete(contactId);
  return contact;
};
