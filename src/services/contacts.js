import { Contact } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export async function getAllContacts({ page, perPage, sort, filter, userId }) {
  const skip = page > 0 ? (page - 1) * perPage : 0;
  filter.userId = userId;
  const contactsQuery = Contact.find(filter);
  const [contacts, totalItems] = await Promise.all([
    contactsQuery.sort(sort).skip(skip).limit(perPage),
    Contact.find(filter).countDocuments(),
  ]);

  return { contacts, ...calculatePaginationData(totalItems, page, perPage) };
}

export const getContactById = async (contactId, userId) => {
  const contact = await Contact.findOne({ _id: contactId, userId });
  return contact;
};

export const createContact = async (payload, userId) => {
  const contact = await Contact.create({ ...payload, userId });
  return contact;
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  options = {}
) => {
  const rawResult = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
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

export const deleteContact = async (contactId, userId) => {
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId });
  return contact;
};
