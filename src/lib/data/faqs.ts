import { FAQItemData } from '@/components/ui/FAQItem';
import { FAQService } from '@/lib/services/faqs';

// Fallback mock data for when database is not available
const mockFAQs: FAQItemData[] = [
  {
    id: '1',
    question: 'How does WhatsApp planning Work?',
    answer: 'Our WhatsApp planning service allows you to communicate directly with our travel experts in real-time. Simply send us a message with your travel preferences, dates, and interests, and we\'ll create a personalized itinerary for your Nigerian adventure. You can ask questions, make changes, and get instant responses throughout your planning process.',
  },
  {
    id: '2',
    question: 'Can I pay in my home currency?',
    answer: 'Yes! We accept payments in multiple currencies including USD, EUR, GBP, and NGN. Our secure payment system automatically converts your payment to the local currency at competitive exchange rates. You\'ll see the exact amount in your preferred currency before confirming your booking.',
  },
  {
    id: '3',
    question: 'What is your cancellation policy?',
    answer: 'We offer flexible cancellation policies to give you peace of mind. You can cancel your booking up to 48 hours before your travel date for a full refund. For cancellations within 48 hours, we provide a 50% refund or the option to reschedule at no additional cost.',
  },
  {
    id: '4',
    question: 'Is airport pickup available on Lagos/Abuja?',
    answer: 'Absolutely! We provide complimentary airport pickup and drop-off services for all our guests arriving at Murtala Muhammed International Airport (Lagos) and Nnamdi Azikiwe International Airport (Abuja). Our professional drivers will be waiting for you with a name sign and will assist with your luggage.',
  },
  {
    id: '5',
    question: 'Are chefs available for special diets?',
    answer: 'Yes, our private chefs are experienced in accommodating various dietary requirements including vegetarian, vegan, halal, kosher, gluten-free, and other special diets. Please inform us of your dietary needs during booking, and we\'ll ensure your meals are prepared according to your preferences.',
  },
  {
    id: '6',
    question: 'What standards do your cars and drivers meet?',
    answer: 'All our vehicles are luxury models (Mercedes-Benz, BMW, or equivalent) that are regularly maintained and inspected. Our drivers are professionally trained, licensed, and have extensive knowledge of Nigerian roads. They speak English fluently and are available 24/7 for your convenience.',
  },
  {
    id: '7',
    question: 'How quickly do you respond to enquiries?',
    answer: 'We pride ourselves on our quick response times. You can expect a response to your initial enquiry within 2 hours during business hours (9 AM - 6 PM WAT) and within 4 hours outside business hours. For urgent matters, our WhatsApp support is available 24/7.',
  },
  {
    id: '8',
    question: 'Do you provide Visa assistance?',
    answer: 'Yes, we provide comprehensive visa assistance for travelers visiting Nigeria. Our team will guide you through the visa application process, help you gather required documents, and provide support throughout the application. We also offer expedited processing services for urgent travel needs.',
  },
];

export const getFAQs = async (): Promise<FAQItemData[]> => {
  try {
    const { data, error } = await FAQService.getActiveFAQs();
    
    if (error) {
      console.error('Error fetching FAQs from database:', error);
      return mockFAQs;
    }

    if (!data || data.length === 0) {
      return mockFAQs;
    }

    // Convert database format to component format
    return data.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
    }));
  } catch (error) {
    console.error('Error in getFAQs:', error);
    return mockFAQs;
  }
};
