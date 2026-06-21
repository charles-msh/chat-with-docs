const { Redis } = require("@upstash/redis");
const r = new Redis({
  url: "https://tolerant-opossum-71160.upstash.io",
  token: "gQAAAAAAARX4AAIgcDFlYjE1YzJlNDI0ZmM0MTljOTk3ZjViNWEzNGYxNzlkNw"
});

const HB = "https://ownersmanual.hyundai.com";
const KB = "https://ownersmanual.kia.com";
const hm = (name, year, code) => `${HB}/manual/${encodeURIComponent(name)}?langCode=ko_KR&countryCode=A99&year=${year}&projCode=${code}`;
const km = (name, year, code) => `${KB}/manual/${encodeURIComponent(name)}?langCode=ko_KR&countryCode=A99VA&year=${year}&projCode=${code}`;

const AG = "https://support.apple.com/ko-kr/guide/iphone";
const ai = (id, ver) => `${AG}/${id}/${ver}/ios/${ver}`;

async function main() {
  const existing = await r.get("chatdocs:public:groups");
  const old = existing ? (typeof existing === "string" ? JSON.parse(existing) : existing) : [];
  const nonCar = old.filter(g => ["pub-macbook","pub-lgtv","pub-ps5"].includes(g.id));

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

  carGroups.forEach((g, i) => {
    g.isFeatured = true;
    g.featuredOrder = 10 + i;
    g.createdAt = now;
  });
  iphoneGroups.forEach((g, i) => {
    g.isFeatured = true;
    g.featuredOrder = 100 + i;
    g.createdAt = now;
  });

  const allGroups = [...nonCar, ...carGroups, ...iphoneGroups];

  const hyundai = carGroups.filter(g => g.category.startsWith("현대"));
  const kia = carGroups.filter(g => g.category.startsWith("기아"));
  console.log(`Non-car groups kept: ${nonCar.length}`);
  console.log(`현대: ${hyundai.length}개 그룹, ${hyundai.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`기아: ${kia.length}개 그룹, ${kia.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`아이폰: ${iphoneGroups.length}개 그룹, ${iphoneGroups.reduce((s,g)=>s+g.urls.length,0)}개 URL`);
  console.log(`Total: ${allGroups.length}개 그룹, ${allGroups.reduce((s,g)=>s+g.urls.length,0)}개 URL`);

  await r.set("chatdocs:public:groups", JSON.stringify(allGroups));
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });
