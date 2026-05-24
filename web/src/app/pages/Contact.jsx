import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useContactUsFormMutation } from 'src/app/services/contactUsApiSlice';
import { toast } from "react-toastify";
import { REMOVE_BORDER_AT } from "src/constants";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const lang = useSelector((state) => state.language.lang);
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [isCooldown, setIsCooldown] = useState(false);



  const [contactUs, { isSuccess, isError, error, isLoading }] = useContactUsFormMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(lang === "en" ? "Message sent successfully." : "Съобщението е изпратено успешно.");
      setIsCooldown(true);
      const timer = setTimeout(() => setIsCooldown(false), 6000); // 6 seconds
      return () => clearTimeout(timer);
    } else if (isError) {
      toast.error(lang === "en" ? "Error" : "Грешка");
    }
  }, [isSuccess, isError, error]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      message: e.target.message.value.trim(),
    };

    if (formData.name.length < 2) {
      return toast.error(lang === "en" ? "Please enter a valid name." : "Моля, въведете валидно име.");
    }
    const isValidEmail = (email) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(formData.email)) {
      return toast.error(lang === "en" ? "Invalid email address." : "Невалиден имейл адрес.");
    }
    if (formData.message.length < 5) {
      return toast.error(lang === "en" ? "Message is too short." : "Съобщението е твърде кратко.");
    }

    try {
      await contactUs(formData).unwrap();
    } catch (error) {
      console.error('Contact form submission failed:', error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={
        screenSize > REMOVE_BORDER_AT ? 'container p-3 my-4 h-100' : 'container my-4 h-100'
      }
    >
      <div className="row d-flex justify-content-center align-items-center h-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
          <form onSubmit={handleSubmit}>
            <div
              className={screenSize > REMOVE_BORDER_AT ? 'card' : ''}
              style={{ borderRadius: '1rem' }}
            >
              <div className="card-body p-1 p-md-5 text-center">
                <div className='mb-5'>
                  <div className="d-flex justify-content-center gap-4 mb-4">
                    <a href="https://www.facebook.com/share/1FFf86hUjx" target="_blank" rel="noopener noreferrer">
                      <img src="/images/facebook.png" alt="Facebook" width="32" height="32" />
                    </a>
                    <a href="https://www.instagram.com/robobg" target="_blank" rel="noopener noreferrer">
                      <img src="/images/instagram.png" alt="Instagram" width="32" height="32" />
                    </a>
                    <a href="https://www.tiktok.com/@robobg" target="_blank" rel="noopener noreferrer">
                      <img src="/images/tik-tok.png" alt="Email" width="32" height="32" />
                    </a>
                  </div>
                </div>
                <h2 className="fw-bold mb-3">
                  {lang === 'en' ? 'Contact us' : 'Свържете се с нас'}
                </h2>
                <div className="form-outline form-white mb-3">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-md"
                    placeholder={lang === 'en' ? 'Name' : 'Име'}
                  />
                </div>
                <div className="form-outline form-white mb-4">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-md"
                    placeholder={lang === 'en' ? 'Email' : 'Имейл'}
                  />
                </div>
                <div className="form-outline form-white mb-3">
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="form-control form-control-md"
                    placeholder={lang === 'en' ? 'Message' : 'Съобщение'}
                    style={{height: '180px'}}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-md px-5 mt-4"
                  disabled={isLoading || isCooldown}
                >
                  {isLoading
                    ? (lang === 'en' ? 'Sending...' : 'Изпращане...')
                    : (lang === 'en' ? 'Submit' : 'Изпращане')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Contact;
