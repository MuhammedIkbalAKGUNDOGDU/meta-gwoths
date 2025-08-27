import React, { useState, useEffect } from "react";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../utils/auth";

const TokenInfo = ({ compact = false }) => {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTokenInfo();
    } else {
      setLoading(false);
      setError("Giriş yapmanız gerekiyor");
    }
  }, [token]);

  const fetchTokenInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(API_ENDPOINTS.tokens), {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Oturum süreniz dolmuş, lütfen tekrar giriş yapın");
        } else if (response.status === 404) {
          setError("Token bilgileri bulunamadı");
        } else {
          setError("Token bilgileri alınamadı");
        }
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setTokenData(data.data.tokens);
      } else {
        setError(data.message || "Token bilgileri alınamadı");
      }
    } catch (err) {
      console.error("Token fetch error:", err);
      setError("Bağlantı hatası - lütfen daha sonra tekrar deneyin");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={compact ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <div className="text-red-600 text-center">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTokenInfo}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className={compact ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <p className="text-gray-500 text-center text-sm">
          Token bilgileri bulunamadı
        </p>
      </div>
    );
  }

  const usagePercentage =
    (tokenData.used_tokens / tokenData.total_tokens) * 100;

  if (compact) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Token Bilgileri
        </h3>

        <div className="space-y-3">
          {/* Token Overview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-blue-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {tokenData.total_tokens}
              </div>
              <div className="text-xs text-gray-600">Toplam</div>
            </div>

            <div className="bg-green-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {tokenData.remaining_tokens}
              </div>
              <div className="text-xs text-gray-600">Kalan</div>
            </div>

            <div className="bg-orange-50 p-2 rounded-lg text-center">
              <div className="text-lg font-bold text-orange-600">
                {tokenData.used_tokens}
              </div>
              <div className="text-xs text-gray-600">Kullanılan</div>
            </div>
          </div>

          {/* Usage Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Kullanım</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Token Bilgileri
      </h3>

      <div className="space-y-4">
        {/* Token Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {tokenData.total_tokens}
            </div>
            <div className="text-sm text-gray-600">Toplam Token</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {tokenData.remaining_tokens}
            </div>
            <div className="text-sm text-gray-600">Kalan Token</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {tokenData.used_tokens}
            </div>
            <div className="text-sm text-gray-600">Kullanılan Token</div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Kullanım Oranı</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center pt-2">
          Son güncelleme:{" "}
          {new Date(tokenData.updated_at).toLocaleString("tr-TR")}
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;
