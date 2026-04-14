import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, Package, Shield, ArrowRight, CheckCircle2, Zap, Clock, MapPin, Star, Sparkles, Phone, Mail, MessageCircle, Gauge, Award, FileCheck, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export function Homepage() {
  const [animatedStats, setAnimatedStats] = useState>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });
  const [autoPlay, setAutoPlay] = useState(true);
  const autoPlayRef = useRef();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', bookingForm);
    // Here you would typically send the booking to a backend API
    alert(`Booking request submitted! We'll contact you at ${bookingForm.phone} to confirm.`);
    setIsBookingOpen(false);
    setBookingForm({ name: '', email: '', phone: '', service: '', date: '', time: '', notes: '' });
  };

  const handleBookingChange = (e: React.ChangeEvent) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const heroSlides = [
    {
      image: '/images/car-repair-maintenance-theme-mechanic-uniform-working-auto-service.jpg',
      title: 'Professional Car Maintenance',
      subtitle: 'Expert technicians keeping your vehicle in perfect condition',
      cta: 'Schedule Service',
    },
    {
      image: '/images/worker-examines-out-order-car-engine.jpg',
      title: 'Advanced Diagnostics',
      subtitle: 'State-of-the-art technology to identify any issue quickly',
      cta: 'Learn More',
    },
    {
      image: '/images/mechanic-repairing-car-parts.jpg',
      title: 'Quality Parts & Service',
      subtitle: 'Genuine parts with a 10-year warranty on all work',
      cta: 'View Services',
    },
  ];

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  useEffect(() => {
    if (autoPlay) startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, heroSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
    setAutoPlay(false);
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    setAutoPlay(false);
  };

  useEffect(() => {
    // Animate stats on load
    const targets = { customers, services, satisfaction: 98 };
    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 40;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedStats(prev => ({ ...prev, [key]: target }));
          clearInterval(interval);
        } else {
          setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, 25);
    });
  }, []);

  const services = [
    { icon, title: 'Regular Maintenance', description: 'Oil changes, filters, fluid checks, and routine inspections' },
    { icon, title: 'Diagnostics', description: 'Advanced computer diagnostics to identify any vehicle issues' },
    { icon, title: 'Parts Replacement', description: 'Brakes, belts, batteries, and other essential components' },
    { icon, title: 'Electrical Repairs', description: 'Electrical system diagnosis and repairs for all vehicle types' },
    { icon, title: 'Preventive Care', description: 'Keep your vehicle running smoothly with preventive services' },
    { icon, title: 'Emergency Service', description: '24/7 emergency support when you need help on the road' },
  ];

  const testimonials = [
    { name: 'Michael Torres', role: 'Customer', text: 'Excellent service and very professional. The team always treats my car with care.', rating, initials: 'MT' },
    { name: 'Emma Richardson', role: 'Fleet Manager', text: 'We use this to manage our entire fleet. The booking system has saved us countless hours.', rating, initials: 'ER' },
    { name: 'David Chen', role: 'Business Owner', text: 'The transparency and professionalism are unmatched. I trust this service completely.', rating, initials: 'DC' },
  ];

  const whyChooseUs = [
    { icon, title: 'Expert Technicians', description: 'ASE-certified mechanics with years of experience' },
    { icon, title: 'Quick Turnaround', description: 'Most services completed same day or next business day' },
    { icon, title: 'Quality Guarantee', description: 'All work backed by our satisfaction guarantee' },
    { icon, title: 'Transparent Pricing', description: 'No hidden fees, detailed estimates before work begins' },
    { icon, title: 'Easy Booking', description: 'Schedule appointments online or by phone in seconds' },
    { icon, title: 'Real-time Updates', description: 'Track your service status with live notifications' },
  ];

  return (
    
      {`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4); } 50% { box-shadow: 0 0 60px rgba(59, 130, 246, 0.8); } }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-down { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-left { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slide-in-right { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-slide-in-up { animation: slide-in-up 0.8s ease-out forwards; }
        .animate-slide-in-down { animation: slide-in-down 0.8s ease-out forwards; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
      `}

      {/* Animated background orbs */}
      
        
        
        
      

      {/* Opening Hours Header */}
      
        
          
            
              
              Opening Hours:
            
            
              Monday - Friday: 8:00 AM - 6:00 PM
              Saturday: 9:00 AM - 4:00 PM
              Sunday: Closed
            
            
              
              (555) 123-4567
            
          
        
      

      {/* Navigation */}
      
        
          
            
              
                
              
              AutoService Pro
            
            
              Services
              Why Us
              Reviews
            
            
              
                Sign In
              
              
                Book Now
              
            
          
        
      

      {/* Hero Carousel Section */}
      
        {`
          @keyframes carousel-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes carousel-fade-out { from { opacity: 1; } to { opacity: 0; } }
          .carousel-slide { animation: carousel-fade-in 0.8s ease-out forwards; }
          .carousel-image { 
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            object-position: center;
          }
        `}
        
        {/* Carousel Slides */}
        
          {heroSlides.map((slide, idx) => (
            
              
              {/* Dark overlay */}
              
              
              {/* Content */}
              
                
                  
                    
                      {slide.cta}
                    
                    
                      {slide.title}
                    
                    
                      {slide.subtitle}
                    
                    
                       setIsBookingOpen(true)}
                      >
                        Book Now
                        
                      
                      
                        Learn More
                      
                    
                  
                
              
            
          ))}
        

        {/* Navigation Buttons */}
        
          
        
        
          
        

        {/* Carousel Indicators */}
        
          {heroSlides.map((_, idx) => (
             {
                setCurrentSlide(idx);
                setAutoPlay(false);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        

        {/* Stats Below Carousel */}
        
          
            
              
                {animatedStats.customers ? `${(animatedStats.customers / 1000).toFixed(0)}k+` : '0'}
                Happy Customers
              
              
                {animatedStats.services ? `${(animatedStats.services / 1000).toFixed(0)}k+` : '0'}
                Services Completed
              
              
                {animatedStats.satisfaction || 0}%
                Customer Satisfaction
              
            
          
        
      

      {/* Services Section */}
      
        
        
          OUR SERVICES
          Comprehensive Car Service Solutions
          From routine maintenance to complex repairs, we handle it all
        

        
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              
                
                  
                    
                  
                  {service.title}
                  {service.description}
                
                
                   setIsBookingOpen(true)}
                    variant="outline" 
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 group-hover:border-blue-400"
                  >
                    Learn More
                  
                
              
            );
          })}
        
      

      {/* How It Works */}
      
        
        
          SIMPLE PROCESS
          How It Works
          Get your car serviced in just 4 simple steps
        

        
          {[
            { number: '1', icon, title: 'Book Online', description: 'Schedule your appointment online in seconds' },
            { number: '2', icon, title: 'Confirmation', description: 'Get instant confirmation and reminders' },
            { number: '3', icon, title: 'Service', description: 'Expert technicians work on your vehicle' },
            { number: '4', icon, title: 'Complete', description: 'Pickup your car and enjoy the results' },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              
                
                
                  
                    {step.number}
                  
                  
                  {step.title}
                  {step.description}
                  {idx }
                
              
            );
          })}
        

        
           setIsBookingOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Ready to Get Started? Book Now
            
          
        
      

      {/* Trust Badges */}
      
        
          {[
            { icon, title: 'ASE Certified', description: 'All technicians are ASE-certified professionals', color: 'from-blue-600' },
            { icon, title: '10-Year Warranty', description: 'Quality guarantee on all our work', color: 'from-cyan-600' },
            { icon, title: 'Money-Back Guarantee', description: '100% satisfaction or your money back', color: 'from-blue-500' },
          ].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              
                
                  
                
                {badge.title}
                {badge.description}
              
            );
          })}
        
      

      {/* Why Choose Us */}
      
        
          WHY CHOOSE US
          The AutoService Pro Difference
          What sets us apart from the competition
        

        
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              
                
                  
                    
                  
                  
                    {item.title}
                    {item.description}
                  
                
              
            );
          })}
        
      

      {/* Testimonials */}
      
        
          CUSTOMER REVIEWS
          Trusted by Thousands
          See what our satisfied customers have to say
        

        
          {testimonials.map((testimonial, idx) => (
            
              
                
                  {[...Array(testimonial.rating)].map((_, i) => (
                    
                  ))}
                
                "{testimonial.text}"
                
                  
                    {testimonial.initials}
                  
                  
                    {testimonial.name}
                    {testimonial.role}
                  
                
                 setIsBookingOpen(true)}
                  variant="outline" 
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-gray-200 mt-4"
                >
                  Get Similar Service
                
              
            
          ))}
        
      

      {/* FAQ Section */}
      
        
          FREQUENTLY ASKED
          Common Questions
          Everything you need to know about our services
        

        
          {[
            { question: 'How do I book an appointment?', answer: 'Simply click "Book Now" at the top of the page or go to our booking page. Select your service, preferred date and time, and we\'ll send you a confirmation.' },
            { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, debit cards, and digital wallets. You can pay online when booking or at our service center.' },
            { question: 'How long does a typical service take?', answer: 'Most services take 1-3 hours depending on the type. We\'ll provide an estimated time when you book your appointment.' },
            { question: 'Do you offer emergency services?', answer: 'Yes! We offer 24/7 emergency roadside assistance. Call (555) 123-4567 to reach our emergency support team anytime.' },
            { question: 'Is there a warranty on your work?', answer: 'Absolutely! All our work comes with a 10-year warranty. If anything goes wrong, we\'ll fix it for free.' },
            { question: 'Can I track my service status?', answer: 'Yes! Once you book, you\'ll receive real-time updates via SMS and email. You can also login to your account to track progress.' },
          ].map((faq, idx) => (
            
              
                {faq.question}
              
              
                {faq.answer}
              
            
          ))}
        
      

      {/* CTA Section */}
      
        
          
          
            Ready to Get Started?
            
              Schedule your service today and experience the difference
            
            
               setIsBookingOpen(true)}
              >
                Book Appointment
                
              
              
                (555) 123-4567
              
            
          
        
      

      {/* Footer */}
      
        
          
            
              
                
                  
                
                AutoService Pro
              
              Professional car service solutions for your peace of mind.
            
            
              Links
              
                Services
                Why Us
                Reviews
              
            
            
              Support
              
                 (555) 123-4567
                 support@autoservice.com
                 24/7 Support
              
            
            
              Location
              
                
                123 Service BoulevardAuto City, CA 90210
              
            
          
          
            &copy; 2026 AutoService Pro. All rights reserved.
          
        
      

      {/* Booking Modal */}
      
        
          
            Book Your Service
            
              Fill in your details and we'll confirm your booking shortly.
            
          
          
          
            {/* Name */}
            
              Full Name *
              
            

            {/* Email */}
            
              Email *
              
            

            {/* Phone */}
            
              Phone Number *
              
            

            {/* Service Type */}
            
              Service Type *
              
                Select a service
                Regular Maintenance
                Diagnostics
                General Repair
                Oil Change
                Brake Service
                Custom Service
              
            

            {/* Date */}
            
              Preferred Date *
              
            

            {/* Time */}
            
              Preferred Time *
              
            

            {/* Notes */}
            
              Additional Notes
              
            

            {/* Submit */}
            
              
                Confirm Booking
              
               setIsBookingOpen(false)}
                className="flex-1"
              >
                Cancel
              
            
          
        
      
    
  );

}




