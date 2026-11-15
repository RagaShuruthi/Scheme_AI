import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  X,
  Minus,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { voiceService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedScheme } from '../utils/schemeTamilTranslations';

const Chatbot = () => {
  const { lang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial welcome message based on language
  const getWelcomeMessage = (currentLang) => {
    if (currentLang === 'ta') {
      return {
        role: 'assistant',
        content:
          '🙏 **வணக்கம்! நான் SchemeSaarthi AI உதவியாளர்.**\n\nதமிழ்நாடு மற்றும் மத்திய அரசின் அனைத்து நலத்திட்டங்கள், உதவித்தொகைகள், விவசாய மானியங்கள், மகளிர் உரிமைத் தொகை மற்றும் முத்ரா கடன்களைக் கண்டறிய நான் உங்களுக்கு உதவுகிறேன்.\n\nநீங்கள் தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்!',
        followups: [
          'மாணவர்களுக்கான கல்வி உதவித்தொகை',
          'விவசாயிகளுக்கான அரசு திட்டங்கள்',
          'மகளிர் நலத்திட்டங்கள் & கடனுதவி',
          'மருத்துவக் காப்பீடு திட்டங்கள்',
          'புதிய தொழில் தொடங்க முத்ரா கடன்'
        ],
        schemes: []
      };
    }
    return {
      role: 'assistant',
      content:
        '👋 **Hello! I am SchemeSaarthi AI Assistant.**\n\nI help citizens and students discover verified Central and Tamil Nadu government welfare schemes, scholarships, farmer grants, women empowerment initiatives, and loans.\n\nHow can I help you today?',
      followups: [
        'Scholarships for college students',
        'Financial aid for farmers',
        'Women entrepreneur loans & KMUT',
        'Free healthcare & PM-JAY insurance',
        'PM Mudra business loans'
      ],
      schemes: []
    };
  };

  // Reset or initialize messages on mount or language switch if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([getWelcomeMessage(lang)]);
    }
  }, [lang]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, isMinimized]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  // Speak response using browser Text-to-Speech
  const speakText = (text, speechLang) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
    }
  };

  // Handle Voice Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        lang === 'ta'
          ? 'உங்கள் உலாவியில் குரல் உள்ளீடு வசதி ஆதரிக்கப்படவில்லை. Google Chrome உலாவியைப் பயன்படுத்தவும்.'
          : 'Speech recognition is not supported in this browser. Please use Google Chrome.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      recognitionRef.current.start();
    }
  };

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    // Add user message
    const userMsg = { role: 'user', content: query };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const res = await voiceService.askAssistant({
        query: query,
        language: lang,
        conversation_history: newHistory.slice(-6).map((m) => ({
          role: m.role,
          content: m.content
        }))
      });

      const data = res.data;
      const botMsg = {
        role: 'assistant',
        content: data.display_response,
        spoken: data.spoken_response,
        schemes: data.matched_schemes || [],
        followups: data.suggested_followups || []
      };

      setMessages((prev) => [...prev, botMsg]);

      if (data.spoken_response) {
        speakText(data.spoken_response, data.language || lang);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMsg = {
        role: 'assistant',
        content:
          lang === 'ta'
            ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, I encountered an issue fetching scheme details. Please try again in a moment.',
        schemes: [],
        followups: []
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Reset conversation
  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([getWelcomeMessage(lang)]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 1. FLOATING CHAT BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-blue-400/30"
          title={lang === 'ta' ? 'அரசு நலத்திட்ட AI உதவியாளர்' : 'SchemeSaarthi AI Assistant'}
        >
          {/* Animated pulse ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
          </span>

          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-bold tracking-wide">
              {lang === 'ta' ? 'நலத்திட்ட AI' : 'Scheme AI'}
            </span>
            <span className="text-[10px] text-blue-200 font-medium">
              {lang === 'ta' ? 'உதவிக்கு கேளுங்கள்' : 'Ask anything'}
            </span>
          </div>
        </button>
      )}

      {/* 2. CHATBOT POPUP WINDOW */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xs font-bold text-xs">
                  <Bot className="w-5 h-5 text-slate-900" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    SchemeSaarthi AI
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                    Online
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {lang === 'ta' ? 'அரசு திட்டங்கள் வழிகாட்டி' : 'Government Welfare Assistant'}
                </span>
              </div>
            </div>

            {/* Header controls */}
            <div className="flex items-center gap-1">
              {/* Sound toggle */}
              <button
                onClick={() => {
                  if (audioEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setAudioEnabled(!audioEnabled);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  audioEnabled
                    ? 'bg-blue-600/50 text-amber-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={audioEnabled ? 'Mute Voice' : 'Enable Voice Readout'}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Reset conversation */}
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={lang === 'ta' ? 'உரையாடலை மீண்டும் தொடங்கு' : 'Reset Conversation'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden if Minimized) */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-blue-700 text-white rounded-br-xs font-medium'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Matched Scheme Preview Cards */}
                        {msg.schemes && msg.schemes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {lang === 'ta' ? 'பரிந்துரைக்கப்பட்ட திட்டங்கள்:' : 'Recommended Schemes:'}
                            </span>
                            {msg.schemes.slice(0, 3).map((rawScheme, sIdx) => {
                              const scheme = getLocalizedScheme(rawScheme, lang);
                              return (
                                <Link
                                  key={sIdx}
                                  to={`/schemes/${scheme.slug || scheme.id}`}
                                  onClick={() => setIsOpen(false)}
                                  className="block bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl p-2.5 transition-all text-slate-800 group"
                                >
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-blue-900 bg-blue-100/80 px-1.5 py-0.2 rounded">
                                      {scheme.government_level_display || scheme.government_level}
                                    </span>
                                    {scheme.match_percentage && (
                                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                                        {scheme.match_percentage}% {lang === 'ta' ? 'பொருத்தம்' : 'Match'}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 leading-snug line-clamp-1">
                                    {scheme.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {scheme.benefits_summary || scheme.short_description}
                                  </p>
                                  <div className="flex items-center justify-end text-[10px] font-bold text-blue-600 mt-1">
                                    <span>{lang === 'ta' ? 'முழு விவரம்' : 'View Scheme'}</span>
                                    <ArrowRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Suggested Followups */}
                      {!isUser && msg.followups && msg.followups.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                          {msg.followups.map((fText, fIdx) => (
                            <button
                              key={fIdx}
                              onClick={() => handleSendMessage(fText)}
                              className="text-[11px] font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-400 rounded-full px-3 py-1 shadow-2xs transition-all cursor-pointer text-left"
                            >
                              {fText}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading typing indicator */}
                {loading && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 max-w-[120px] shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      lang === 'ta'
                        ? 'உங்கள் கேள்வியை தட்டச்சு செய்யவும்...'
                        : 'Ask about any scheme or eligibility...'
                    }
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                  />

                  {/* Speech to text mic button */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                    title={
                      isListening
                        ? lang === 'ta' ? 'பேசுவதை நிறுத்து' : 'Stop Listening'
                        : lang === 'ta' ? 'குரல் மூலம் பேசு' : 'Speak via Voice'
                    }
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || loading}
                    className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                    title={lang === 'ta' ? 'அனுப்பு' : 'Send'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>
                    {lang === 'ta'
                      ? 'தமிழ் & ஆங்கிலம் இரண்டிலும் கேட்கலாம்'
                      : 'Supports English & Tamil queries'}
                  </span>
                  <span className="flex items-center gap-0.5 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {lang === 'ta' ? 'அதிகாரப்பூர்வ தகவல்' : 'Verified Data'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
