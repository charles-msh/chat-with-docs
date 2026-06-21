const { Redis } = require("@upstash/redis");
const r = new Redis({
  url: "https://tolerant-opossum-71160.upstash.io",
  token: "gQAAAAAAARX4AAIgcDFlYjE1YzJlNDI0ZmM0MTljOTk3ZjViNWEzNGYxNzlkNw"
});

const HB = "https://ownersmanual.hyundai.com";
const KB = "https://ownersmanual.kia.com";
const hm = (name, year, code) => `${HB}/manual/${encodeURIComponent(name)}?langCode=ko_KR&countryCode=A99&year=${year}&projCode=${code}`;
const km = (name, year, code) => `${KB}/manual/${encodeURIComponent(name)}?langCode=ko_KR&countryCode=A99VA&year=${year}&projCode=${code}`;

const AG = "https://support.apple.com/ko-kr/guide";
const ai = (id, ver) => `${AG}/iphone/${id}/${ver}/ios/${ver}`;
const ap = (id, ver) => `${AG}/ipad/${id}/${ver}/ipados/${ver}`;
const am = (id, ver) => `${AG}/mac-help/${id}/${ver}/mac/${ver}`;
const aw = (id, ver) => `${AG}/watch/${id}/${ver}/watchos/${ver}`;
const aa = (id) => `${AG}/airpods/${id}/web`;

const NS = "https://www.nintendo.co.kr/support/switch";
const PS = "https://www.playstation.com/ko-kr/support";

async function main() {
  const existing = await r.get("chatdocs:public:groups");
  const old = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : [];
  const nonCar = old.filter(g => ["pub-lgtv"].includes(g.id));

  const now = new Date().toISOString();
  const carGroups = [
    // ========== 현대 아반떼 ==========
    { id: "pub-h-avante", name: "현대 아반떼 CN7", emoji: "🚗", category: "현대 아반떼",
      description: "현대 아반떼 7세대 CN7 2026년식 취급설명서",
      urls: [hm("아반떼", 2026, "CN7")] },
    { id: "pub-h-avante-hev", name: "현대 아반떼 하이브리드 CN7HEV", emoji: "🚗", category: "현대 아반떼",
      description: "현대 아반떼 하이브리드 CN7HEV 2026년식 취급설명서",
      urls: [hm("아반떼 Hybrid", 2026, "CN7HEV")] },
    { id: "pub-h-avante-n", name: "현대 아반떼 N CN7N", emoji: "🏎️", category: "현대 아반떼",
      description: "현대 아반떼 N CN7N 2026년식 취급설명서",
      urls: [hm("아반떼 N", 2026, "CN7N")] },

    // ========== 현대 쏘나타 ==========
    { id: "pub-h-sonata", name: "현대 쏘나타 DN8", emoji: "🚗", category: "현대 쏘나타",
      description: "현대 쏘나타 8세대 DN8 2026년식 취급설명서",
      urls: [hm("쏘나타", 2026, "DN8")] },
    { id: "pub-h-sonata-hev", name: "현대 쏘나타 하이브리드 DN8HEV", emoji: "🚗", category: "현대 쏘나타",
      description: "현대 쏘나타 하이브리드 DN8HEV 2026년식 취급설명서",
      urls: [hm("쏘나타 Hybrid", 2026, "DN8HEV")] },

    // ========== 현대 그랜저 ==========
    { id: "pub-h-grandeur", name: "현대 그랜저 GN7", emoji: "🚗", category: "현대 그랜저",
      description: "현대 그랜저 7세대 GN7 2027년식 취급설명서",
      urls: [hm("그랜저", 2027, "GN7")] },
    { id: "pub-h-grandeur-hev", name: "현대 그랜저 하이브리드 GN7HEV", emoji: "🚗", category: "현대 그랜저",
      description: "현대 그랜저 하이브리드 GN7HEV 2026년식 취급설명서",
      urls: [hm("그랜저 Hybrid", 2026, "GN7HEV")] },

    // ========== 현대 투싼 ==========
    { id: "pub-h-tucson", name: "현대 투싼 NX4", emoji: "🚗", category: "현대 투싼",
      description: "현대 투싼 4세대 NX4 2026년식 취급설명서",
      urls: [hm("투싼", 2026, "NX4")] },
    { id: "pub-h-tucson-hev", name: "현대 투싼 하이브리드 NX4HEV", emoji: "🚗", category: "현대 투싼",
      description: "현대 투싼 하이브리드 NX4HEV 2026년식 취급설명서",
      urls: [hm("투싼 Hybrid", 2026, "NX4HEV")] },

    // ========== 현대 싼타페 ==========
    { id: "pub-h-santafe", name: "현대 싼타페 MX5", emoji: "🚗", category: "현대 싼타페",
      description: "현대 싼타페 5세대 MX5 2026년식 취급설명서",
      urls: [hm("싼타페", 2026, "MX5")] },
    { id: "pub-h-santafe-hev", name: "현대 싼타페 하이브리드 MX5HEV", emoji: "🚗", category: "현대 싼타페",
      description: "현대 싼타페 하이브리드 MX5HEV 2026년식 취급설명서",
      urls: [hm("싼타페 Hybrid", 2026, "MX5HEV")] },

    // ========== 현대 팰리세이드 ==========
    { id: "pub-h-palisade", name: "현대 팰리세이드 LX3", emoji: "🚗", category: "현대 팰리세이드",
      description: "현대 팰리세이드 2세대 LX3 2026년식 취급설명서",
      urls: [hm("팰리세이드", 2026, "LX3")] },
    { id: "pub-h-palisade-hev", name: "현대 팰리세이드 하이브리드 LX3HEV", emoji: "🚗", category: "현대 팰리세이드",
      description: "현대 팰리세이드 하이브리드 LX3HEV 2026년식 취급설명서",
      urls: [hm("팰리세이드 Hybrid", 2026, "LX3HEV")] },

    // ========== 현대 코나 ==========
    { id: "pub-h-kona", name: "현대 코나 SX2", emoji: "🚗", category: "현대 코나",
      description: "현대 코나 2세대 SX2 2027년식 취급설명서",
      urls: [hm("코나", 2027, "SX2")] },
    { id: "pub-h-kona-hev", name: "현대 코나 하이브리드 SX2HEV", emoji: "🚗", category: "현대 코나",
      description: "현대 코나 하이브리드 SX2HEV 2027년식 취급설명서",
      urls: [hm("코나 Hybrid", 2027, "SX2HEV")] },

    // ========== 현대 캐스퍼 ==========
    { id: "pub-h-casper", name: "현대 캐스퍼 AX", emoji: "🚗", category: "현대 캐스퍼",
      description: "현대 캐스퍼 AX 2026년식 취급설명서",
      urls: [hm("캐스퍼", 2026, "AX")] },

    // ========== 현대 베뉴 ==========
    { id: "pub-h-venue", name: "현대 베뉴 QX", emoji: "🚗", category: "현대 베뉴",
      description: "현대 베뉴 QX 2026년식 취급설명서",
      urls: [hm("베뉴", 2026, "QX")] },

    // ========== 현대 아이오닉 5 ==========
    { id: "pub-h-ioniq5", name: "현대 아이오닉 5 NE1", emoji: "⚡", category: "현대 아이오닉 5",
      description: "현대 아이오닉 5 NE1 2026년식 취급설명서",
      urls: [hm("아이오닉 5", 2026, "NE1")] },
    { id: "pub-h-ioniq5-n", name: "현대 아이오닉 5 N NE1N", emoji: "⚡", category: "현대 아이오닉 5",
      description: "현대 아이오닉 5 N NE1N 2026년식 취급설명서",
      urls: [hm("아이오닉 5 N", 2026, "NE1N")] },

    // ========== 현대 아이오닉 6 ==========
    { id: "pub-h-ioniq6", name: "현대 아이오닉 6 CE1", emoji: "⚡", category: "현대 아이오닉 6",
      description: "현대 아이오닉 6 CE1 2025년식 취급설명서",
      urls: [hm("아이오닉 6", 2025, "CE1")] },

    // ========== 현대 아이오닉 9 ==========
    { id: "pub-h-ioniq9", name: "현대 아이오닉 9 ME", emoji: "⚡", category: "현대 아이오닉 9",
      description: "현대 아이오닉 9 ME 2027년식 취급설명서",
      urls: [hm("아이오닉 9", 2027, "ME")] },

    // ========== 현대 넥쏘 ==========
    { id: "pub-h-nexo", name: "현대 넥쏘 FE", emoji: "⚡", category: "현대 넥쏘",
      description: "현대 넥쏘 수소전기차 FE 2024년식 취급설명서",
      urls: [hm("넥쏘", 2024, "FE")] },

    // ========== 현대 스타리아 ==========
    { id: "pub-h-staria", name: "현대 스타리아 US4", emoji: "🚐", category: "현대 스타리아",
      description: "현대 스타리아 US4 2026년식 취급설명서",
      urls: [hm("스타리아", 2026, "US4")] },

    // ========== 기아 모닝 ==========
    { id: "pub-k-morning", name: "기아 모닝 JA", emoji: "🚙", category: "기아 모닝",
      description: "기아 모닝 JA 2027년식 취급설명서",
      urls: [km("모닝", 2027, "JA")] },

    // ========== 기아 레이 ==========
    { id: "pub-k-ray", name: "기아 레이 TAM", emoji: "🚙", category: "기아 레이",
      description: "기아 레이 TAM 2026년식 취급설명서",
      urls: [km("RAY", 2026, "TAM")] },

    // ========== 기아 K3 ==========
    { id: "pub-k-k3", name: "기아 K3 BD", emoji: "🚙", category: "기아 K3",
      description: "기아 K3 BD 2024년식 취급설명서",
      urls: [km("K3", 2024, "BD")] },

    // ========== 기아 K5 ==========
    { id: "pub-k-k5", name: "기아 K5 DL3", emoji: "🚙", category: "기아 K5",
      description: "기아 K5 3세대 DL3 2026년식 취급설명서",
      urls: [km("K5", 2026, "DL3")] },
    { id: "pub-k-k5-hev", name: "기아 K5 하이브리드 DL3KH", emoji: "🚙", category: "기아 K5",
      description: "기아 K5 하이브리드 DL3KH 2026년식 취급설명서",
      urls: [km("K5 Hybrid", 2026, "DL3KH")] },

    // ========== 기아 K8 ==========
    { id: "pub-k-k8", name: "기아 K8 GL3", emoji: "🚙", category: "기아 K8",
      description: "기아 K8 GL3 2026년식 취급설명서",
      urls: [km("K8", 2026, "GL3")] },
    { id: "pub-k-k8-hev", name: "기아 K8 하이브리드 GL3KH", emoji: "🚙", category: "기아 K8",
      description: "기아 K8 하이브리드 GL3KH 2026년식 취급설명서",
      urls: [km("K8 Hybrid", 2026, "GL3KH")] },

    // ========== 기아 K9 ==========
    { id: "pub-k-k9", name: "기아 K9 RJ", emoji: "🚙", category: "기아 K9",
      description: "기아 K9 RJ 2026년식 취급설명서",
      urls: [km("K9", 2026, "RJ")] },

    // ========== 기아 셀토스 ==========
    { id: "pub-k-seltos", name: "기아 셀토스 SP3", emoji: "🚙", category: "기아 셀토스",
      description: "기아 셀토스 2세대 SP3 2026년식 취급설명서",
      urls: [km("셀토스", 2026, "SP3")] },

    // ========== 기아 스포티지 ==========
    { id: "pub-k-sportage", name: "기아 스포티지 NQ5", emoji: "🚙", category: "기아 스포티지",
      description: "기아 스포티지 5세대 NQ5 2026년식 취급설명서",
      urls: [km("Sportage", 2026, "NQ5")] },
    { id: "pub-k-sportage-hev", name: "기아 스포티지 하이브리드 NQ5KH", emoji: "🚙", category: "기아 스포티지",
      description: "기아 스포티지 하이브리드 NQ5KH 2026년식 취급설명서",
      urls: [km("Sportage Hybrid", 2026, "NQ5KH")] },

    // ========== 기아 쏘렌토 ==========
    { id: "pub-k-sorento", name: "기아 쏘렌토 MQ4", emoji: "🚙", category: "기아 쏘렌토",
      description: "기아 쏘렌토 4세대 MQ4 2026년식 취급설명서",
      urls: [km("Sorento", 2026, "MQ4")] },
    { id: "pub-k-sorento-hev", name: "기아 쏘렌토 하이브리드 MQ4KH", emoji: "🚙", category: "기아 쏘렌토",
      description: "기아 쏘렌토 하이브리드 MQ4KH 2026년식 취급설명서",
      urls: [km("Sorento Hybrid", 2026, "MQ4KH")] },

    // ========== 기아 모하비 ==========
    { id: "pub-k-mohave", name: "기아 모하비 HM", emoji: "🚙", category: "기아 모하비",
      description: "기아 모하비 HM 2024년식 취급설명서",
      urls: [km("모하비", 2024, "HM")] },

    // ========== 기아 카니발 ==========
    { id: "pub-k-carnival", name: "기아 카니발 KA4", emoji: "🚐", category: "기아 카니발",
      description: "기아 카니발 4세대 KA4 2026년식 취급설명서",
      urls: [km("Carnival", 2026, "KA4")] },
    { id: "pub-k-carnival-hev", name: "기아 카니발 하이브리드 KA4KH", emoji: "🚐", category: "기아 카니발",
      description: "기아 카니발 하이브리드 KA4KH 2026년식 취급설명서",
      urls: [km("Carnival Hybrid", 2026, "KA4KH")] },

    // ========== 기아 EV3 ==========
    { id: "pub-k-ev3", name: "기아 EV3 SV1", emoji: "⚡", category: "기아 EV3",
      description: "기아 EV3 SV1 2027년식 취급설명서",
      urls: [km("EV3", 2027, "SV1")] },

    // ========== 기아 EV4 ==========
    { id: "pub-k-ev4", name: "기아 EV4 CT1", emoji: "⚡", category: "기아 EV4",
      description: "기아 EV4 CT1 2027년식 취급설명서",
      urls: [km("EV4", 2027, "CT1")] },

    // ========== 기아 EV5 ==========
    { id: "pub-k-ev5", name: "기아 EV5 OV1K", emoji: "⚡", category: "기아 EV5",
      description: "기아 EV5 OV1K 2026년식 취급설명서",
      urls: [km("EV5", 2026, "OV1K")] },

    // ========== 기아 EV6 ==========
    { id: "pub-k-ev6", name: "기아 EV6 CV1", emoji: "⚡", category: "기아 EV6",
      description: "기아 EV6 CV1 2026년식 취급설명서",
      urls: [km("EV6", 2026, "CV1")] },

    // ========== 기아 EV9 ==========
    { id: "pub-k-ev9", name: "기아 EV9 MV1", emoji: "⚡", category: "기아 EV9",
      description: "기아 EV9 MV1 2027년식 취급설명서",
      urls: [km("EV9", 2027, "MV1")] },

    // ========== 기아 니로 ==========
    { id: "pub-k-niro", name: "기아 니로 SG2", emoji: "🚙", category: "기아 니로",
      description: "기아 니로 2세대 SG2 2027년식 취급설명서",
      urls: [km("Niro", 2027, "SG2")] },
    { id: "pub-k-niro-ev", name: "기아 니로 EV SG2KV", emoji: "⚡", category: "기아 니로",
      description: "기아 니로 EV SG2KV 2026년식 취급설명서",
      urls: [km("Niro EV", 2026, "SG2KV")] },

    // ========== 기아 타스만 ==========
    { id: "pub-k-tasman", name: "기아 타스만 TK1", emoji: "🛻", category: "기아 타스만",
      description: "기아 타스만 TK1 2027년식 취급설명서",
      urls: [km("타스만", 2027, "TK1")] },
  ];

  // ========== 애플 아이폰 ==========
  const iphoneGroups = [
    { id: "pub-iphone-ios26", name: "아이폰 iOS 26 사용 설명서", emoji: "📱", category: "애플 아이폰",
      description: "Apple iPhone iOS 26 공식 사용 설명서 - 설정, 카메라, 배터리, Safari, Siri, 접근성 등",
      urls: [
        ai("welcome", "26"),
        ai("iph9374b7411", "26"),
        ai("iph1fd7e482f", "26"),
        ai("iph263472f78", "26"),
        ai("iph63eecc618", "26"),
        ai("iph3d039b67", "26"),
        ai("iph1fbef4daa", "26"),
        ai("iphc259d0ac7", "26"),
        ai("iph6e7d349d1", "26"),
        ai("iph83aad8922", "26"),
        ai("iph3e2e4367", "26"),
      ] },
    { id: "pub-iphone-ios18", name: "아이폰 iOS 18 사용 설명서", emoji: "📱", category: "애플 아이폰",
      description: "Apple iPhone iOS 18 공식 사용 설명서 - 설정, 카메라, 배터리, Safari, Siri, 접근성 등",
      urls: [
        ai("welcome", "18.0"),
        ai("iph9374b7411", "18.0"),
        ai("iph1fd7e482f", "18.0"),
        ai("iph263472f78", "18.0"),
        ai("iph63eecc618", "18.0"),
        ai("iph3d039b67", "18.0"),
        ai("iph1fbef4daa", "18.0"),
        ai("iphc259d0ac7", "18.0"),
        ai("iph6e7d349d1", "18.0"),
        ai("iph83aad8922", "18.0"),
        ai("iph3e2e4367", "18.0"),
      ] },
    { id: "pub-iphone-ios17", name: "아이폰 iOS 17 사용 설명서", emoji: "📱", category: "애플 아이폰",
      description: "Apple iPhone iOS 17 공식 사용 설명서 - 설정, 카메라, 배터리, Safari, Siri, 접근성 등",
      urls: [
        ai("welcome", "17.0"),
        ai("iph9374b7411", "17.0"),
        ai("iph1fd7e482f", "17.0"),
        ai("iph263472f78", "17.0"),
        ai("iph63eecc618", "17.0"),
        ai("iph3d039b67", "17.0"),
        ai("iph1fbef4daa", "17.0"),
        ai("iphc259d0ac7", "17.0"),
        ai("iph6e7d349d1", "17.0"),
        ai("iph83aad8922", "17.0"),
        ai("iph3e2e4367", "17.0"),
      ] },
    { id: "pub-iphone-ios16", name: "아이폰 iOS 16 사용 설명서", emoji: "📱", category: "애플 아이폰",
      description: "Apple iPhone iOS 16 공식 사용 설명서 - 설정, 카메라, 배터리, Safari, Siri, 접근성 등",
      urls: [
        ai("welcome", "16.0"),
        ai("iph9374b7411", "16.0"),
        ai("iph1fd7e482f", "16.0"),
        ai("iph263472f78", "16.0"),
        ai("iph63eecc618", "16.0"),
        ai("iph3d039b67", "16.0"),
        ai("iph1fbef4daa", "16.0"),
        ai("iphc259d0ac7", "16.0"),
        ai("iph6e7d349d1", "16.0"),
        ai("iph83aad8922", "16.0"),
        ai("iph3e2e4367", "16.0"),
      ] },
  ];

  // ========== 애플 아이패드 ==========
  const ipadGroups = [
    { id: "pub-ipad-26", name: "아이패드 iPadOS 26 사용 설명서", emoji: "📱", category: "애플 아이패드",
      description: "Apple iPad iPadOS 26 공식 사용 설명서 - 설정, 카메라, 멀티태스킹, Apple Pencil, 키보드, Safari 등",
      urls: [
        ap("welcome", "26"), ap("ipadad6ac8d3", "26"), ap("ipad99b53a71", "26"),
        ap("ipad997da965", "26"), ap("ipad08c9970c", "26"), ap("ipad89415cd5", "26"),
        ap("ipad4b92bd12", "26"), ap("ipad999d68f9", "26"), ap("ipadba23b9b4", "26"),
        ap("ipad9a2465f9", "26"), ap("ipad9b4cea76", "26"),
      ] },
    { id: "pub-ipad-18", name: "아이패드 iPadOS 18 사용 설명서", emoji: "📱", category: "애플 아이패드",
      description: "Apple iPad iPadOS 18 공식 사용 설명서 - 설정, 카메라, 멀티태스킹, Apple Pencil, 키보드, Safari 등",
      urls: [
        ap("welcome", "18.0"), ap("ipadad6ac8d3", "18.0"), ap("ipad99b53a71", "18.0"),
        ap("ipad997da965", "18.0"), ap("ipad08c9970c", "18.0"), ap("ipad89415cd5", "18.0"),
        ap("ipad4b92bd12", "18.0"), ap("ipad999d68f9", "18.0"), ap("ipadba23b9b4", "18.0"),
        ap("ipad9a2465f9", "18.0"), ap("ipad9b4cea76", "18.0"),
      ] },
    { id: "pub-ipad-17", name: "아이패드 iPadOS 17 사용 설명서", emoji: "📱", category: "애플 아이패드",
      description: "Apple iPad iPadOS 17 공식 사용 설명서 - 설정, 카메라, 멀티태스킹, Apple Pencil, 키보드, Safari 등",
      urls: [
        ap("welcome", "17.0"), ap("ipadad6ac8d3", "17.0"), ap("ipad99b53a71", "17.0"),
        ap("ipad997da965", "17.0"), ap("ipad08c9970c", "17.0"), ap("ipad89415cd5", "17.0"),
        ap("ipad4b92bd12", "17.0"), ap("ipad999d68f9", "17.0"), ap("ipadba23b9b4", "17.0"),
        ap("ipad9a2465f9", "17.0"), ap("ipad9b4cea76", "17.0"),
      ] },
    { id: "pub-ipad-16", name: "아이패드 iPadOS 16 사용 설명서", emoji: "📱", category: "애플 아이패드",
      description: "Apple iPad iPadOS 16 공식 사용 설명서 - 설정, 카메라, 멀티태스킹, Apple Pencil, 키보드, Safari 등",
      urls: [
        ap("welcome", "16.0"), ap("ipadad6ac8d3", "16.0"), ap("ipad99b53a71", "16.0"),
        ap("ipad997da965", "16.0"), ap("ipad08c9970c", "16.0"), ap("ipad89415cd5", "16.0"),
        ap("ipad4b92bd12", "16.0"), ap("ipad999d68f9", "16.0"), ap("ipadba23b9b4", "16.0"),
        ap("ipad9a2465f9", "16.0"), ap("ipad9b4cea76", "16.0"),
      ] },
  ];

  // ========== 애플 맥 ==========
  const macGroups = [
    { id: "pub-mac-26", name: "맥 macOS Tahoe 사용 설명서", emoji: "💻", category: "애플 맥",
      description: "Apple Mac macOS Tahoe 26 공식 사용 설명서 - Finder, Safari, 시스템설정, 단축키, 보안 등",
      urls: [
        am("welcome", "26"), am("mchl3a2c2cb0", "26"), am("mchlp2605", "26"),
        am("ibrw1005", "26"), am("mh15217", "26"), am("mh35848", "26"),
        am("mchlp2704", "26"), am("mchlp2262", "26"), am("mh35884", "26"),
        am("flvlt003", "26"), am("mchl110b00b7", "26"),
      ] },
    { id: "pub-mac-15", name: "맥 macOS Sequoia 사용 설명서", emoji: "💻", category: "애플 맥",
      description: "Apple Mac macOS Sequoia 15 공식 사용 설명서 - Finder, Safari, 시스템설정, 단축키, 보안 등",
      urls: [
        am("welcome", "15"), am("mchl3a2c2cb0", "15"), am("mchlp2605", "15"),
        am("ibrw1005", "15"), am("mh15217", "15"), am("mh35848", "15"),
        am("mchlp2704", "15"), am("mchlp2262", "15"), am("mh35884", "15"),
        am("flvlt003", "15"), am("mchl110b00b7", "15"),
      ] },
    { id: "pub-mac-14", name: "맥 macOS Sonoma 사용 설명서", emoji: "💻", category: "애플 맥",
      description: "Apple Mac macOS Sonoma 14 공식 사용 설명서 - Finder, Safari, 시스템설정, 단축키, 보안 등",
      urls: [
        am("welcome", "14"), am("mchl3a2c2cb0", "14"), am("mchlp2605", "14"),
        am("ibrw1005", "14"), am("mh15217", "14"), am("mh35848", "14"),
        am("mchlp2704", "14"), am("mchlp2262", "14"), am("mh35884", "14"),
        am("flvlt003", "14"), am("mchl110b00b7", "14"),
      ] },
    { id: "pub-mac-13", name: "맥 macOS Ventura 사용 설명서", emoji: "💻", category: "애플 맥",
      description: "Apple Mac macOS Ventura 13 공식 사용 설명서 - Finder, Safari, 시스템설정, 단축키, 보안 등",
      urls: [
        am("welcome", "13"), am("mchl3a2c2cb0", "13"), am("mchlp2605", "13"),
        am("ibrw1005", "13"), am("mh15217", "13"), am("mh35848", "13"),
        am("mchlp2704", "13"), am("mchlp2262", "13"), am("mh35884", "13"),
        am("flvlt003", "13"), am("mchl110b00b7", "13"),
      ] },
  ];

  // ========== 애플 워치 ==========
  const watchGroups = [
    { id: "pub-watch-26", name: "애플워치 watchOS 26 사용 설명서", emoji: "⌚", category: "애플 워치",
      description: "Apple Watch watchOS 26 공식 사용 설명서 - 건강, 운동, 알림, 워치페이스, Apple Pay 등",
      urls: [
        aw("welcome", "26"), aw("apd1456230aa", "26"), aw("apd7941a2f19", "26"),
        aw("apd4edc9bc20", "26"), aw("apde978ebff5", "26"), aw("apda6559ad78", "26"),
        aw("apd2b717523a", "26"), aw("apd99e3c6a68", "26"), aw("apdaabc79d3b", "26"),
        aw("apd285b3ae01", "26"), aw("apdcf848d29e", "26"),
      ] },
    { id: "pub-watch-11", name: "애플워치 watchOS 11 사용 설명서", emoji: "⌚", category: "애플 워치",
      description: "Apple Watch watchOS 11 공식 사용 설명서 - 건강, 운동, 알림, 워치페이스, Apple Pay 등",
      urls: [
        aw("welcome", "11"), aw("apd1456230aa", "11"), aw("apd7941a2f19", "11"),
        aw("apd4edc9bc20", "11"), aw("apde978ebff5", "11"), aw("apda6559ad78", "11"),
        aw("apd2b717523a", "11"), aw("apd99e3c6a68", "11"), aw("apdaabc79d3b", "11"),
        aw("apd285b3ae01", "11"), aw("apdcf848d29e", "11"),
      ] },
    { id: "pub-watch-10", name: "애플워치 watchOS 10 사용 설명서", emoji: "⌚", category: "애플 워치",
      description: "Apple Watch watchOS 10 공식 사용 설명서 - 건강, 운동, 알림, 워치페이스, Apple Pay 등",
      urls: [
        aw("welcome", "10"), aw("apd1456230aa", "10"), aw("apd7941a2f19", "10"),
        aw("apd4edc9bc20", "10"), aw("apde978ebff5", "10"), aw("apda6559ad78", "10"),
        aw("apd2b717523a", "10"), aw("apd99e3c6a68", "10"), aw("apdaabc79d3b", "10"),
        aw("apd285b3ae01", "10"), aw("apdcf848d29e", "10"),
      ] },
    { id: "pub-watch-9", name: "애플워치 watchOS 9 사용 설명서", emoji: "⌚", category: "애플 워치",
      description: "Apple Watch watchOS 9 공식 사용 설명서 - 건강, 운동, 알림, 워치페이스, Apple Pay 등",
      urls: [
        aw("welcome", "9"), aw("apd1456230aa", "9"), aw("apd7941a2f19", "9"),
        aw("apd4edc9bc20", "9"), aw("apde978ebff5", "9"), aw("apda6559ad78", "9"),
        aw("apd2b717523a", "9"), aw("apd99e3c6a68", "9"), aw("apdaabc79d3b", "9"),
        aw("apd285b3ae01", "9"), aw("apdcf848d29e", "9"),
      ] },
  ];

  // ========== 애플 에어팟 ==========
  const airpodsGroups = [
    { id: "pub-airpods", name: "에어팟 사용 설명서", emoji: "🎧", category: "애플 에어팟",
      description: "Apple AirPods 공식 사용 설명서 - 페어링, 노이즈캔슬링, 공간음향, 충전, Siri, 나의찾기 등",
      urls: [
        aa("welcome"), aa("dev7c85810f2"), aa("devb2c431317"),
        aa("dev9812f5cc3"), aa("dev00eb7e0a3"), aa("devde25a4bbe"),
        aa("devc2c0f438a"), aa("dev8e8b93d71"), aa("devec5c64a16"),
      ] },
  ];

  // ========== 닌텐도 Switch ==========
  const nintendoGroups = [
    { id: "pub-switch", name: "닌텐도 Switch 사용 설명서", emoji: "🎮", category: "닌텐도 Switch",
      description: "Nintendo Switch 공식 사용 설명서 - 초기설정, 조이콘, 인터넷, eShop, 데이터관리, 보호자설정 등",
      urls: [
        `${NS}/`,
        `${NS}/setting/`,
        `${NS}/controller/`,
        `${NS}/internet/`,
        `${NS}/playmode/`,
        `${NS}/power/`,
        `${NS}/eshop/`,
        `${NS}/data_management/`,
        `${NS}/parentalcontrols/`,
        `${NS}/user/`,
        `${NS}/accessories/`,
      ] },
  ];

  // ========== PlayStation 5 ==========
  const ps5Groups = [
    { id: "pub-ps5-setup", name: "PS5 본체 설정 및 하드웨어", emoji: "🎮", category: "PlayStation 5",
      description: "PS5 초기 설정, 컨트롤러, SSD 확장, 세이프모드, 전원, 오디오, 디스크 등",
      urls: [
        `${PS}/hardware/ps5/`,
        `${PS}/hardware/ps5-get-started-set-up/`,
        `${PS}/hardware/pair-dualsense-controller-bluetooth/`,
        `${PS}/hardware/ps5-install-m2-ssd/`,
        `${PS}/hardware/ps5-extended-storage/`,
        `${PS}/hardware/safe-mode-playstation/`,
        `${PS}/hardware/ps5-ps4-power-indicator-lights/`,
        `${PS}/hardware/ps5-change-audio-output/`,
        `${PS}/hardware/3d-audio-ps5/`,
        `${PS}/hardware/ps5-4k-resolution-guide/`,
        `${PS}/hardware/ps5-accessibility-settings/`,
        `${PS}/hardware/ps5-eject-stuck-disc/`,
      ] },
    { id: "pub-ps5-games", name: "PS5 게임 및 온라인", emoji: "🎮", category: "PlayStation 5",
      description: "PS5 리모트플레이, 화면공유, 트로피, 세이브데이터, 방송, 디스코드 등",
      urls: [
        `${PS}/games/playstation-remote-play-on-mobile-devices/`,
        `${PS}/games/playstation-remote-play-on-pc-and-mac/`,
        `${PS}/games/ps5-share-play/`,
        `${PS}/games/ps5-share-screen/`,
        `${PS}/games/ps5-party-voice-chat/`,
        `${PS}/games/discord-voice-chat/`,
        `${PS}/games/how-to-earn-trophies-on-playstation--consoles/`,
        `${PS}/games/capture-ps5-gameplay-screenshots/`,
        `${PS}/games/upgrade-ps4-game-to-ps5-version/`,
        `${PS}/games/ps5-backward-compatibility-games/`,
        `${PS}/hardware/transfer-games-saved-data-ps4-ps5/`,
      ] },
    { id: "pub-ps5-account", name: "PS5 계정 및 보안", emoji: "🎮", category: "PlayStation 5",
      description: "PSN 계정 관리, 2단계 인증, 패밀리 설정, 개인정보, 콘솔 공유 등",
      urls: [
        `${PS}/account/create-account/`,
        `${PS}/account/password-reset/`,
        `${PS}/account/2sv-psn-login/`,
        `${PS}/account/set-up-passkey/`,
        `${PS}/account/ps5-console-sharing-offline-play/`,
        `${PS}/account/playstation-family-account-set-up/`,
        `${PS}/account/ps5-parental-controls-spending-limits/`,
        `${PS}/account/privacy-settings/`,
        `${PS}/account/change-online-id/`,
        `${PS}/account/security-best-practice/`,
      ] },
  ];

  const gameGroups = [...nintendoGroups, ...ps5Groups];
  const appleGroups = [...iphoneGroups, ...ipadGroups, ...macGroups, ...watchGroups, ...airpodsGroups];
  const allNew = [...carGroups, ...appleGroups, ...gameGroups];

  allNew.forEach((g, i) => {
    g.isFeatured = true;
    g.featuredOrder = 10 + i;
    g.createdAt = now;
  });

  const allGroups = [...nonCar, ...allNew];

  const hyundai = carGroups.filter(g => g.category.startsWith("현대"));
  const kia = carGroups.filter(g => g.category.startsWith("기아"));
  console.log(`Non-car groups kept: ${nonCar.length}`);
  console.log(`현대: ${hyundai.length}개 그룹, ${hyundai.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`기아: ${kia.length}개 그룹, ${kia.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`애플: ${appleGroups.length}개 그룹, ${appleGroups.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`게임: ${gameGroups.length}개 그룹, ${gameGroups.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`Total: ${allGroups.length}개 그룹, ${allGroups.reduce((s,g)=>s+g.urls.length,0)}개 URL`);

  await r.set("chatdocs:public:groups", JSON.stringify(allGroups));
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });
