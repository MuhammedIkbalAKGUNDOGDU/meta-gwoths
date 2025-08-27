import React, { useState, useEffect } from "react";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { getAdminToken, getAdminHeaders } from "../utils/adminAuth";

const TokenManagementPage = () => {
  const [allTokens, setAllTokens] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [purchaseDescription, setPurchaseDescription] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const [tokensResponse, transactionsResponse, customersResponse] =
        await Promise.all([
          fetch(getApiUrl(API_ENDPOINTS.allTokens), {
            headers: getAdminHeaders(token),
          }),
          fetch(getApiUrl(API_ENDPOINTS.allTokenTransactions), {
            headers: getAdminHeaders(token),
          }),
          fetch(getApiUrl("/auth/customers/all"), {
            headers: getAdminHeaders(token),
          }),
        ]);

      const tokensData = await tokensResponse.json();
      const transactionsData = await transactionsResponse.json();
      const customersData = await customersResponse.json();

      if (tokensData.status === "success") {
        setAllTokens(tokensData.data.tokens);
      }

      if (transactionsData.status === "success") {
        setAllTransactions(transactionsData.data.transactions);
      }

      if (customersData.status === "success") {
        setAllCustomers(customersData.data.customers);
      }
    } catch (err) {
      setError("Veriler alınırken bir hata oluştu");
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTokens = async () => {
    if (!selectedUser || !purchaseAmount || purchaseAmount <= 0) {
      alert("Lütfen geçerli bir miktar girin");
      return;
    }

    try {
      const token = getAdminToken();
      const response = await fetch(getApiUrl(API_ENDPOINTS.purchaseTokens), {
        method: "POST",
        headers: getAdminHeaders(token),
        body: JSON.stringify({
          customer_id: selectedUser.customer_id,
          amount: parseInt(purchaseAmount),
          description: purchaseDescription || "Admin tarafından token ekleme",
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Token başarıyla eklendi");
        setShowPurchaseModal(false);
        setPurchaseAmount("");
        setPurchaseDescription("");
        setSelectedUser(null);
        fetchAllData(); // Refresh data
      } else {
        alert(data.message || "Token eklenirken bir hata oluştu");
      }
    } catch (err) {
      alert("Token eklenirken bir hata oluştu");
      console.error("Purchase error:", err);
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800";
      case "usage":
        return "bg-red-100 text-red-800";
      case "refund":
        return "bg-blue-100 text-blue-800";
      case "bonus":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "purchase":
        return "Satın Alma";
      case "usage":
        return "Kullanım";
      case "refund":
        return "İade";
      case "bonus":
        return "Bonus";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-red-600 text-center">
            <p>{error}</p>
            <button
              onClick={fetchAllData}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Token Yönetimi</h1>
          <p className="mt-2 text-gray-600">
            Tüm kullanıcıların token bilgilerini görüntüleyin ve yönetin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Kullanıcı Token Bilgileri
              </h2>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Token Ekle
              </button>
            </div>

            <div className="space-y-4">
              {allTokens.map((userToken) => (
                <div
                  key={userToken.customer_id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {userToken.first_name} {userToken.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{userToken.email}</p>
                      {userToken.company && (
                        <p className="text-xs text-gray-500">
                          {userToken.company}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {userToken.remaining_tokens}
                      </div>
                      <div className="text-xs text-gray-500">Kalan Token</div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Toplam:</span>
                      <span className="ml-1 font-medium">
                        {userToken.total_tokens}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Kullanılan:</span>
                      <span className="ml-1 font-medium">
                        {userToken.used_tokens}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Oran:</span>
                      <span className="ml-1 font-medium">
                        {(
                          (userToken.used_tokens / userToken.total_tokens) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Token İşlem Geçmişi
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getTransactionTypeColor(
                            transaction.transaction_type
                          )}`}
                        >
                          {getTransactionTypeText(transaction.transaction_type)}
                        </span>
                        <span className="text-sm font-medium">
                          {transaction.first_name} {transaction.last_name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {transaction.description || "Token işlemi"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleString(
                          "tr-TR"
                        )}
                      </p>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.transaction_type === "usage"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.transaction_type === "usage" ? "-" : "+"}
                      {transaction.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Token Ekle</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Seç
                  </label>
                  <select
                    value={selectedUser?.customer_id || ""}
                    onChange={(e) => {
                      const user = allCustomers.find(
                        (u) => u.customer_id === parseInt(e.target.value)
                      );
                      setSelectedUser(user);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Kullanıcı seçin</option>
                    {allCustomers.map((user) => {
                      const userToken = allTokens.find(
                        (t) => t.customer_id === user.customer_id
                      );
                      const currentTokens = userToken
                        ? userToken.remaining_tokens
                        : 0;
                      return (
                        <option key={user.customer_id} value={user.customer_id}>
                          {user.first_name} {user.last_name} ({user.email})
                          {user.company && ` - ${user.company}`}
                          {` - Mevcut: ${currentTokens} token`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token Miktarı
                  </label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Token miktarı"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={purchaseDescription}
                    onChange={(e) => setPurchaseDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="İşlem açıklaması"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setPurchaseAmount("");
                    setPurchaseDescription("");
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handlePurchaseTokens}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Token Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenManagementPage;
