import axios from 'axios';
import FormData from 'form-data';

async function test() {
  const form = new FormData();
  form.append('firstName', 'Test');
  form.append('lastName', 'Admin');
  form.append('email', 'testadmin_' + Date.now() + '@example.com');
  form.append('phone', '+251911223344');
  form.append('password', 'Password123!');
  form.append('organizationName', 'Test Org');
  form.append('businessType', 'Event Organizer');
  form.append('country', 'ET');
  form.append('city', 'Addis Ababa');
  form.append('region', 'Addis Ababa');
  form.append('streetAddress', 'Bole');
  form.append('adminRole', 'event organizer');

  try {
    const res = await axios.post('http://localhost:5002/api/signup/admin', form, {
      headers: form.getHeaders(),
    });
    console.log('Status:', res.status);
    console.log('Data:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
