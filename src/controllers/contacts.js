import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import {
  parseFilterParams,
  parseSortParams,
} from '../utils/parseAdditionParams.js';
import { saveFileToCloudinary } from '../utils/saveToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';

export const getAllContactsController = async (req, res, next) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const sort = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const contacts = await getAllContacts({
    page,
    perPage,
    sort,
    filter,
    userId: req.user._id,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactById(contactId, userId);

  // Відповідь, якщо контакт не знайдено
  if (!contact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  // Відповідь, якщо контакт знайдено
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const userId = req.user._id;
  let payload = { ...req.body };

  if (req.file) {
    try {
      const photoUrl =
        process.env.ENABLE_CLOUDINARY === 'true'
          ? await saveFileToCloudinary(req.file)
          : await saveFileToUploadDir(req.file);

      payload.photo = photoUrl;
    } catch (error) {
      throw createHttpError(500, `Failed to upload photo: ${error.message}`);
    }
  }
  const contact = await createContact(payload, userId);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  let payload = req.body;
  if (req.file) {
    try {
      const photoUrl =
        process.env.ENABLE_CLOUDINARY === 'true'
          ? await saveFileToCloudinary(req.file)
          : await saveFileToUploadDir(req.file);

      payload.photo = photoUrl;
    } catch (error) {
      throw createHttpError(500, `Failed to upload photo: ${error.message}`);
    }
  }
  const contact = await updateContact(contactId, payload, userId);
  if (!contact) throw createHttpError.NotFound('Contact not found');
  res.status(200).json({
    status: 200,
    message: `Successfully updated contact with id ${contactId}!`,
    data: contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await deleteContact(contactId, userId);

  if (!contact) {
    throw new createHttpError.NotFound('Contact not found');
  }

  res.status(204).send();
};
