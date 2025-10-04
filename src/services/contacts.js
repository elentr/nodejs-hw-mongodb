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

export const updateContact = async (contactId, payload, options = {}) => {
  const rawResult = await Contact.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    }
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upsert),
  };
};

export const deleteContact = async contactId => {
  const contact = await Contact.findByIdAndDelete(contactId);
  return contact;
};
