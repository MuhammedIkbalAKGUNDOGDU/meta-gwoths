import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";
import { isAuthenticated } from "../utils/auth";

const SurveyPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const questions = [
    {
      id: 1,
      question: "İşletmenizin adı nedir?",
      type: "text",
      placeholder: "İşletme adınızı yazın...",
    },
    {
      id: 2,
      question:
        "Sosyal medya hesap linklerinizi paylaşır mısınız? (Instagram, Facebook, TikTok vb.)",
      type: "textarea",
      placeholder: "Sosyal medya linklerinizi yazın...",
    },
    {
      id: 3,
      question:
        "Web siteniz veya online satış platformunuz var mı? (Varsa link veriniz)",
      type: "text",
      placeholder: "Web sitesi linkinizi yazın...",
    },
    {
      id: 4,
      question: "Hangi şehir ve semtte hizmet veriyorsunuz?",
      type: "text",
      placeholder: "Şehir ve semt bilginizi yazın...",
    },
    {
      id: 5,
      question:
        "Ürün/hizmet kategoriniz nedir? (Mobilya, Güzellik Salonu, Butik, vb.)",
      type: "text",
      placeholder: "Kategori bilginizi yazın...",
    },
    {
      id: 6,
      question: "Aylık ortalama reklam bütçeniz nedir?",
      type: "select",
      options: ["5k-10k", "10k-25k", "25k-50k", "50k+", "Henüz belirlemedik"],
    },
    {
      id: 7,
      question:
        "Hedeflediğiniz müşteri kitlesi kimdir? (Yaş, Cinsiyet, Gelir Grubu, İlgi Alanları)",
      type: "textarea",
      placeholder: "Hedef kitlenizi detaylandırın...",
    },
    {
      id: 8,
      question: "Şu anda aktif olarak reklam veriyor musunuz?",
      type: "radio",
      options: ["Evet", "Hayır"],
    },
    {
      id: 9,
      question:
        "Daha önce reklam verdiyseniz, hangi platformları kullandınız? (Instagram, Facebook, Google, TikTok vb.)",
      type: "textarea",
      placeholder: "Kullandığınız platformları yazın...",
    },
    {
      id: 10,
      question: "Daha önceki reklamlarınızdan memnun kaldınız mı?",
      type: "radio",
      options: ["Evet", "Hayır", "Kısmen"],
      followUp: "Neden?",
    },
    {
      id: 11,
      question: "Şu anda içerik üretimi yapıyor musunuz?",
      type: "radio",
      options: ["Evet", "Hayır"],
      followUp: "Haftalık kaç içerik?",
    },
    {
      id: 12,
      question: "Profesyonel fotoğraf/video çekimi yaptırıyor musunuz?",
      type: "radio",
      options: ["Evet", "Hayır", "Planlıyoruz"],
    },
    {
      id: 13,
      question:
        "Ürün/hizmet fiyat aralığınız nedir? (Ortalama fiyat bilgisi veriniz)",
      type: "text",
      placeholder: "Fiyat aralığınızı yazın...",
    },
    {
      id: 14,
      question: "En çok sattığınız 3 ürün veya hizmet nedir?",
      type: "textarea",
      placeholder: "En çok satan ürünlerinizi yazın...",
    },
    {
      id: 15,
      question: "Hangi günler kampanya yapmayı tercih ediyorsunuz?",
      type: "checkbox",
      options: [
        "Cuma",
        "Hafta Sonu",
        "Resmi Tatiller",
        "Sezon Başlangıçları",
        "Özel Günler",
        "Diğer",
      ],
    },
    {
      id: 16,
      question:
        "Şu an müşterileriniz sizi neden tercih ediyor? (Fiyat, kalite, hız, konum, özel hizmet vb.)",
      type: "textarea",
      placeholder: "Tercih edilme nedenlerinizi yazın...",
    },
    {
      id: 17,
      question:
        "Markanızın ön plana çıkmasını istediğiniz özellikleri nelerdir?",
      type: "checkbox",
      options: [
        "Kalite",
        "Uygun Fiyat",
        "Lüks",
        "Hızlı Teslimat",
        "Özel Hizmet",
        "Yenilikçilik",
        "Diğer",
      ],
    },
    {
      id: 18,
      question: "Müşterilerin en çok sorduğu sorular nelerdir?",
      type: "textarea",
      placeholder: "Sık sorulan soruları yazın...",
    },
    {
      id: 19,
      question: "Şu anda stok durumunuz nasıl?",
      type: "radio",
      options: [
        "Her üründe stok var",
        "Sadece belli ürünler var",
        "Stok sorunu yaşıyoruz",
      ],
    },
    {
      id: 20,
      question: "Sipariş süreçleriniz nasıl işliyor?",
      type: "radio",
      options: [
        "Aynı gün teslim",
        "3-5 gün teslim",
        "Sipariş üzerine üretim",
        "Stoktan teslim",
      ],
    },
    {
      id: 21,
      question: "Ürün teslimatını nasıl yapıyorsunuz?",
      type: "checkbox",
      options: [
        "Kargo",
        "Kendi araçlarımız",
        "Müşteri gelip alıyor",
        "Ücretsiz teslimat",
        "Diğer",
      ],
    },
    {
      id: 22,
      question: "Çalıştığınız özel kampanya dönemleri var mı?",
      type: "textarea",
      placeholder: "Kampanya dönemlerinizi yazın...",
    },
    {
      id: 23,
      question: "Müşteri yorumlarınızı topladığınız platformlar var mı?",
      type: "checkbox",
      options: ["Google", "Instagram", "Trendyol", "Facebook", "Diğer"],
    },
    {
      id: 24,
      question: "Şu anda sizi zorlayan en büyük problem nedir?",
      type: "radio",
      options: [
        "Satış",
        "İçerik üretimi",
        "Reklam bütçesi",
        "Müşteri trafiği",
        "Diğer",
      ],
    },
    {
      id: 25,
      question: "Bizim size nasıl bir katkı sağlamamızı beklersiniz?",
      type: "checkbox",
      options: [
        "Satış artırma",
        "Marka bilinirliği",
        "İçerik üretimi",
        "Reklam yönetimi",
        "Hepsini",
        "Diğer",
      ],
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    checkSurveyStatus();
  }, []);

  const checkSurveyStatus = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      const token = localStorage.getItem("metagrowths_token");

      const response = await fetch(getApiUrl(API_ENDPOINTS.survey), {
        method: "GET",
        headers: getAuthHeaders(token),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data.survey.is_completed) {
          // Anket zaten doldurulmuş, dashboard'a yönlendir
          alert(
            "Anketiniz zaten doldurulmuş! Dashboard'a yönlendiriliyorsunuz."
          );
          navigate("/dashboard");
          return;
        }
      }
    } catch (error) {
      console.error("Survey status check error:", error);
      // Hata durumunda anket sayfasını göster
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsVisible(false);
    setTimeout(() => setIsVisible(true), 300);
  }, [currentQuestion]);

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowPreview(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (!isAuthenticated()) {
        throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
      }

      const token = localStorage.getItem("metagrowths_token");

      const response = await fetch(getApiUrl(API_ENDPOINTS.survey), {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          answers: answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Anket tamamlama başarısız");
      }

      // Başarılı gönderim
      alert(
        "Anket cevaplarınız başarıyla kaydedildi! Paket seçim sayfasına yönlendiriliyorsunuz."
      );
      navigate("/reklam-paket-secim");
    } catch (error) {
      console.error("Survey submission error:", error);
      alert(error.message || "Anket gönderimi sırasında bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[currentQuestion] || "";

    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        );

      case "textarea":
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={question.placeholder}
            rows="4"
            className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
          />
        );

      case "select":
        return (
          <div className="space-y-3">
            <select
              value={currentAnswer}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            >
              <option value="">Seçiniz...</option>
              {question.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {currentAnswer === "Diğer" && (
              <input
                type="text"
                placeholder="Lütfen belirtiniz..."
                className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                onChange={(e) => handleAnswer(`Diğer: ${e.target.value}`)}
              />
            )}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
            {question.followUp && currentAnswer && (
              <input
                type="text"
                placeholder={question.followUp}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(currentAnswer) &&
                    currentAnswer.includes(option)
                  }
                  onChange={(e) => {
                    const newAnswer = Array.isArray(currentAnswer)
                      ? currentAnswer.filter(
                          (item) => !item.startsWith("Diğer:")
                        )
                      : [];
                    if (e.target.checked) {
                      handleAnswer([...newAnswer, option]);
                    } else {
                      handleAnswer(newAnswer.filter((item) => item !== option));
                    }
                  }}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
            {Array.isArray(currentAnswer) &&
              currentAnswer.includes("Diğer") && (
                <input
                  type="text"
                  placeholder="Lütfen belirtiniz..."
                  className="w-full p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  onChange={(e) => {
                    const newAnswer = currentAnswer.filter(
                      (item) => !item.startsWith("Diğer:")
                    );
                    handleAnswer([...newAnswer, `Diğer: ${e.target.value}`]);
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.trim()) {
                      const newAnswer = currentAnswer.filter(
                        (item) => item !== "Diğer" && !item.startsWith("Diğer:")
                      );
                      handleAnswer(newAnswer);
                    }
                  }}
                />
              )}
          </div>
        );

      default:
        return null;
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <div
            className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4">
                Anket Tamamlandı!
              </h1>
              <p className="text-slate-600 text-lg">
                Cevaplarınız başarıyla alındı. İşletmeniz için özel bir strateji
                hazırlayacağız.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  📊 Anket Özeti
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Toplam Soru:</span>
                    <span className="font-semibold">25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cevaplanan:</span>
                    <span className="font-semibold text-green-600">
                      {Object.keys(answers).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamamlanma:</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round((Object.keys(answers).length / 25) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  🎯 Sonraki Adımlar
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Analiz süreci başlatılacak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Özel strateji hazırlanacak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>3-5 gün içinde iletişime geçeceğiz</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-8 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                Geri Dön
              </button>
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {showAnswers ? "Cevapları Gizle" : "Cevapları Görüntüle"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Gönderiliyor...</span>
                  </div>
                ) : (
                  "Demam Et"
                )}
              </button>
            </div>

            {/* Answers Preview */}
            {showAnswers && (
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
                  📋 Anket Cevaplarınız
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((q, index) => {
                    const answer = answers[index];
                    if (
                      !answer ||
                      (Array.isArray(answer) && answer.length === 0)
                    )
                      return null;

                    return (
                      <div
                        key={q.id}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {q.id}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-2">
                              {q.question}
                            </h4>
                            <div className="bg-slate-50 rounded-lg p-3">
                              {Array.isArray(answer) ? (
                                <div className="space-y-1">
                                  {answer.map((item, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center space-x-2"
                                    >
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-slate-700">
                                        {item}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-700">{answer}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading durumunda spinner göster
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-16">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Anket durumu kontrol ediliyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Anket İlerlemesi
            </h2>
            <span className="text-sm text-slate-600">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentQ.id}
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                {currentQ.question}
              </h1>
            </div>
          </div>

          <div className="mb-8">{renderQuestion(currentQ)}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Önceki
            </button>

            <button
              onClick={handleNext}
              disabled={
                !answers[currentQuestion] ||
                (Array.isArray(answers[currentQuestion]) &&
                  answers[currentQuestion].length === 0)
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? "Bitir" : "Sonraki →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
