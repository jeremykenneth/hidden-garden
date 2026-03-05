import { saveFormData } from './firestoreUtils';
import { saveLocalFormData } from './formSubmissions';

export const handleContactFormSubmit = async (event) => {
  event.preventDefault();

  try {
    const form = event.target;

    const formData = {
      name: form.contactName.value,
      email: form.contactEmail.value,
      message: form.contactMessage.value
    };

    try {
      await saveFormData('contactSubmissions', formData);
    } catch (firestoreError) {
      saveLocalFormData('contactSubmissions', formData);
    }

    form.reset();
    alert('Your message has been sent successfully!');

    const modal = document.getElementById('contactModal');
    if (modal) {
      modal.classList.remove('show');
    }

    return true;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    alert('There was an error sending your message. Please try again later.');
    return false;
  }
};
