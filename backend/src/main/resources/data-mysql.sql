-- notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    follow_notify BOOLEAN NOT NULL DEFAULT TRUE,
    comment_notify BOOLEAN NOT NULL DEFAULT TRUE,
    like_notify BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Stock seed data
-- Using INSERT IGNORE for MySQL compatibility
-- chosung = Korean consonant extraction for search (e.g. 삼성전자 → ㅅㅅㅈㅈ)

-- ============================================================
-- S&P 500 / NASDAQ 100 — Major Tech
-- ============================================================
INSERT IGNORE INTO stocks (ticker, name_en, name_ko, chosung, logo_url, sector, exchange, active) VALUES
('AAPL', 'Apple Inc.', '애플', 'ㅇㅍ', 'https://cdn.tickerlogos.com/apple.com', 'Technology', 'NASDAQ', true),
('MSFT', 'Microsoft Corporation', '마이크로소프트', 'ㅁㅇㅋㄹㅅㅍㅌ', 'https://cdn.tickerlogos.com/microsoft.com', 'Technology', 'NASDAQ', true),
('GOOGL', 'Alphabet Inc.', '알파벳 (구글)', 'ㅇㅍㅂ (ㄱㄱ)', 'https://cdn.tickerlogos.com/google.com', 'Technology', 'NASDAQ', true),
('GOOG', 'Alphabet Inc. Class C', '알파벳 C', 'ㅇㅍㅂ C', 'https://cdn.tickerlogos.com/google.com', 'Technology', 'NASDAQ', true),
('AMZN', 'Amazon.com Inc.', '아마존', 'ㅇㅁㅈ', 'https://cdn.tickerlogos.com/amazon.com', 'Consumer Cyclical', 'NASDAQ', true),
('NVDA', 'NVIDIA Corporation', '엔비디아', 'ㅇㅂㄷㅇ', 'https://cdn.tickerlogos.com/nvidia.com', 'Technology', 'NASDAQ', true),
('TSLA', 'Tesla Inc.', '테슬라', 'ㅌㅅㄹ', 'https://cdn.tickerlogos.com/tesla.com', 'Consumer Cyclical', 'NASDAQ', true),
('META', 'Meta Platforms Inc.', '메타', 'ㅁㅌ', 'https://cdn.tickerlogos.com/meta.com', 'Technology', 'NASDAQ', true),
('AVGO', 'Broadcom Inc.', '브로드컴', 'ㅂㄹㄷㅋ', 'https://cdn.tickerlogos.com/broadcom.com', 'Technology', 'NASDAQ', true),
('ORCL', 'Oracle Corporation', '오라클', 'ㅇㄹㅋ', 'https://cdn.tickerlogos.com/oracle.com', 'Technology', 'NYSE', true),
('CRM', 'Salesforce Inc.', '세일즈포스', 'ㅅㅇㅈㅍㅅ', 'https://cdn.tickerlogos.com/salesforce.com', 'Technology', 'NYSE', true),
('AMD', 'Advanced Micro Devices', 'AMD', NULL, 'https://cdn.tickerlogos.com/amd.com', 'Technology', 'NASDAQ', true),
('ADBE', 'Adobe Inc.', '어도비', 'ㅇㄷㅂ', 'https://cdn.tickerlogos.com/adobe.com', 'Technology', 'NASDAQ', true),
('INTC', 'Intel Corporation', '인텔', 'ㅇㅌ', 'https://cdn.tickerlogos.com/intel.com', 'Technology', 'NASDAQ', true),
('CSCO', 'Cisco Systems Inc.', '시스코', 'ㅅㅅㅋ', 'https://cdn.tickerlogos.com/cisco.com', 'Technology', 'NASDAQ', true),
('QCOM', 'Qualcomm Inc.', '퀄컴', 'ㅋㅋ', 'https://cdn.tickerlogos.com/qualcomm.com', 'Technology', 'NASDAQ', true),
('TXN', 'Texas Instruments', '텍사스인스트루먼트', 'ㅌㅅㅅㅇㅅㅌㄹㅁㅌ', 'https://cdn.tickerlogos.com/ti.com', 'Technology', 'NASDAQ', true),
('IBM', 'International Business Machines', 'IBM', NULL, 'https://cdn.tickerlogos.com/ibm.com', 'Technology', 'NYSE', true),
('NOW', 'ServiceNow Inc.', '서비스나우', 'ㅅㅂㅅㄴㅇ', 'https://cdn.tickerlogos.com/servicenow.com', 'Technology', 'NYSE', true),
('AMAT', 'Applied Materials Inc.', '어플라이드머티리얼즈', 'ㅇㅍㄹㅇㄷㅁㅌㄹㅇㅈ', 'https://cdn.tickerlogos.com/appliedmaterials.com', 'Technology', 'NASDAQ', true),
('LRCX', 'Lam Research Corp.', '램리서치', 'ㄹㄹㅅㅊ', 'https://cdn.tickerlogos.com/lamresearch.com', 'Technology', 'NASDAQ', true),
('MU', 'Micron Technology', '마이크론', 'ㅁㅇㅋㄹ', 'https://cdn.tickerlogos.com/micron.com', 'Technology', 'NASDAQ', true),
('KLAC', 'KLA Corporation', 'KLA', NULL, 'https://cdn.tickerlogos.com/kla.com', 'Technology', 'NASDAQ', true),
('SNPS', 'Synopsys Inc.', '시놉시스', 'ㅅㄴㅅㅅ', 'https://cdn.tickerlogos.com/synopsys.com', 'Technology', 'NASDAQ', true),
('CDNS', 'Cadence Design Systems', '케이던스', 'ㅋㅇㄷㅅ', 'https://cdn.tickerlogos.com/cadence.com', 'Technology', 'NASDAQ', true),
('MRVL', 'Marvell Technology', '마벨테크놀로지', 'ㅁㅂㅌㅋㄴㄹㅈ', 'https://cdn.tickerlogos.com/marvell.com', 'Technology', 'NASDAQ', true),
('ARM', 'Arm Holdings plc', 'ARM', NULL, 'https://cdn.tickerlogos.com/arm.com', 'Technology', 'NASDAQ', true),
('PLTR', 'Palantir Technologies', '팔란티어', 'ㅍㄹㅌㅇ', 'https://cdn.tickerlogos.com/palantir.com', 'Technology', 'NASDAQ', true),
('PANW', 'Palo Alto Networks', '팔로알토네트웍스', 'ㅍㄹㅇㅌㄴㅌㅇㅅ', 'https://cdn.tickerlogos.com/paloaltonetworks.com', 'Technology', 'NASDAQ', true),
('CRWD', 'CrowdStrike Holdings', '크라우드스트라이크', 'ㅋㄹㅇㄷㅅㅌㄹㅇㅋ', 'https://cdn.tickerlogos.com/crowdstrike.com', 'Technology', 'NASDAQ', true),
('FTNT', 'Fortinet Inc.', '포티넷', 'ㅍㅌㄴ', 'https://cdn.tickerlogos.com/fortinet.com', 'Technology', 'NASDAQ', true),
('ZS', 'Zscaler Inc.', '지스케일러', 'ㅈㅅㅋㅇㄹ', 'https://cdn.tickerlogos.com/zscaler.com', 'Technology', 'NASDAQ', true),
('SHOP', 'Shopify Inc.', '쇼피파이', 'ㅅㅍㅍㅇ', 'https://cdn.tickerlogos.com/shopify.com', 'Technology', 'NYSE', true),
('SNOW', 'Snowflake Inc.', '스노우플레이크', 'ㅅㄴㅇㅍㄹㅇㅋ', 'https://cdn.tickerlogos.com/snowflake.com', 'Technology', 'NYSE', true),
('NET', 'Cloudflare Inc.', '클라우드플레어', 'ㅋㄹㅇㄷㅍㄹㅇ', 'https://cdn.tickerlogos.com/cloudflare.com', 'Technology', 'NYSE', true),
('DDOG', 'Datadog Inc.', '데이터독', 'ㄷㅇㅌㄷ', 'https://cdn.tickerlogos.com/datadoghq.com', 'Technology', 'NASDAQ', true),
('UBER', 'Uber Technologies Inc.', '우버', 'ㅇㅂ', 'https://cdn.tickerlogos.com/uber.com', 'Technology', 'NYSE', true),
('SQ', 'Block Inc.', '블록 (스퀘어)', 'ㅂㄹ (ㅅㅋㅇ)', 'https://cdn.tickerlogos.com/block.xyz', 'Technology', 'NYSE', true),
('INTU', 'Intuit Inc.', '인튜잇', 'ㅇㅌㅇ', 'https://cdn.tickerlogos.com/intuit.com', 'Technology', 'NASDAQ', true),
('WDAY', 'Workday Inc.', '워크데이', 'ㅇㅋㄷㅇ', 'https://cdn.tickerlogos.com/workday.com', 'Technology', 'NASDAQ', true),
('TEAM', 'Atlassian Corp.', '아틀라시안', 'ㅇㅌㄹㅅㅇ', 'https://cdn.tickerlogos.com/atlassian.com', 'Technology', 'NASDAQ', true),
('HUBS', 'HubSpot Inc.', '허브스팟', 'ㅎㅂㅅㅍ', 'https://cdn.tickerlogos.com/hubspot.com', 'Technology', 'NYSE', true),
('VEEV', 'Veeva Systems', '비바시스템즈', 'ㅂㅂㅅㅅㅌㅈ', 'https://cdn.tickerlogos.com/veeva.com', 'Technology', 'NYSE', true),
('BILL', 'BILL Holdings Inc.', '빌', 'ㅂ', 'https://cdn.tickerlogos.com/bill.com', 'Technology', 'NYSE', true),
('SMCI', 'Super Micro Computer', '슈퍼마이크로', 'ㅅㅍㅁㅇㅋㄹ', 'https://cdn.tickerlogos.com/supermicro.com', 'Technology', 'NASDAQ', true),
('ON', 'ON Semiconductor', 'ON세미컨덕터', 'ONㅅㅁㅋㄷㅌ', 'https://cdn.tickerlogos.com/onsemi.com', 'Technology', 'NASDAQ', true),
('MCHP', 'Microchip Technology', '마이크로칩', 'ㅁㅇㅋㄹㅊ', 'https://cdn.tickerlogos.com/microchip.com', 'Technology', 'NASDAQ', true),
('NXPI', 'NXP Semiconductors', 'NXP세미컨덕터스', 'NXPㅅㅁㅋㄷㅌㅅ', 'https://cdn.tickerlogos.com/nxp.com', 'Technology', 'NASDAQ', true),
('ADI', 'Analog Devices', '아날로그디바이시스', 'ㅇㄴㄹㄱㄷㅂㅇㅅㅅ', 'https://cdn.tickerlogos.com/analog.com', 'Technology', 'NASDAQ', true),
('MPWR', 'Monolithic Power Systems', '모놀리식파워', 'ㅁㄴㄹㅅㅍㅇ', 'https://cdn.tickerlogos.com/monolithicpower.com', 'Technology', 'NASDAQ', true),

-- ============================================================
-- S&P 500 — Financial Services
-- ============================================================
('BRK.B', 'Berkshire Hathaway Inc.', '버크셔 해서웨이', 'ㅂㅋㅅ ㅎㅅㅇㅇ', 'https://cdn.tickerlogos.com/berkshirehathaway.com', 'Financial Services', 'NYSE', true),
('BRK.A', 'Berkshire Hathaway Class A', '버크셔 해서웨이 A', 'ㅂㅋㅅ ㅎㅅㅇㅇ A', 'https://cdn.tickerlogos.com/berkshirehathaway.com', 'Financial Services', 'NYSE', true),
('JPM', 'JPMorgan Chase & Co.', 'JP모건', 'JPㅁㄱ', 'https://cdn.tickerlogos.com/jpmorganchase.com', 'Financial Services', 'NYSE', true),
('V', 'Visa Inc.', '비자', 'ㅂㅈ', 'https://cdn.tickerlogos.com/visa.com', 'Financial Services', 'NYSE', true),
('MA', 'Mastercard Inc.', '마스터카드', 'ㅁㅅㅌㅋㄷ', 'https://cdn.tickerlogos.com/mastercard.com', 'Financial Services', 'NYSE', true),
('BAC', 'Bank of America Corp.', '뱅크오브아메리카', 'ㅂㅋㅇㅂㅇㅁㄹㅋ', 'https://cdn.tickerlogos.com/bankofamerica.com', 'Financial Services', 'NYSE', true),
('GS', 'Goldman Sachs Group', '골드만삭스', 'ㄱㄷㅁㅅㅅ', 'https://cdn.tickerlogos.com/goldmansachs.com', 'Financial Services', 'NYSE', true),
('MS', 'Morgan Stanley', '모건스탠리', 'ㅁㄱㅅㅌㄹ', 'https://cdn.tickerlogos.com/morganstanley.com', 'Financial Services', 'NYSE', true),
('BLK', 'BlackRock Inc.', '블랙록', 'ㅂㄹㄹ', 'https://cdn.tickerlogos.com/blackrock.com', 'Financial Services', 'NYSE', true),
('SPGI', 'S&P Global Inc.', 'S&P글로벌', 'S&Pㄱㄹㅂ', 'https://cdn.tickerlogos.com/spglobal.com', 'Financial Services', 'NYSE', true),
('AXP', 'American Express Co.', '아메리칸익스프레스', 'ㅇㅁㄹㅋㅇㅅㅍㄹㅅ', 'https://cdn.tickerlogos.com/americanexpress.com', 'Financial Services', 'NYSE', true),
('PYPL', 'PayPal Holdings Inc.', '페이팔', 'ㅍㅇㅍ', 'https://cdn.tickerlogos.com/paypal.com', 'Financial Services', 'NASDAQ', true),
('COIN', 'Coinbase Global Inc.', '코인베이스', 'ㅋㅇㅂㅇㅅ', 'https://cdn.tickerlogos.com/coinbase.com', 'Financial Services', 'NASDAQ', true),
('SOFI', 'SoFi Technologies Inc.', '소파이', 'ㅅㅍㅇ', 'https://cdn.tickerlogos.com/sofi.com', 'Financial Services', 'NASDAQ', true),
('C', 'Citigroup Inc.', '씨티그룹', 'ㅆㅌㄱㄹ', 'https://cdn.tickerlogos.com/citigroup.com', 'Financial Services', 'NYSE', true),
('WFC', 'Wells Fargo & Co.', '웰스파고', 'ㅇㅅㅍㄱ', 'https://cdn.tickerlogos.com/wellsfargo.com', 'Financial Services', 'NYSE', true),
('SCHW', 'Charles Schwab Corp.', '찰스슈왑', 'ㅊㅅㅅㅇ', 'https://cdn.tickerlogos.com/schwab.com', 'Financial Services', 'NYSE', true),
('CB', 'Chubb Limited', '처브', 'ㅊㅂ', 'https://cdn.tickerlogos.com/chubb.com', 'Financial Services', 'NYSE', true),
('MMC', 'Marsh & McLennan', '마쉬앤맥레넌', 'ㅁㅅㅇㅁㄹㄴ', 'https://cdn.tickerlogos.com/marshmclennan.com', 'Financial Services', 'NYSE', true),
('ICE', 'Intercontinental Exchange', '인터콘티넨탈익스체인지', 'ㅇㅌㅋㅌㄴㅌㅇㅅㅊㅇㅈ', 'https://cdn.tickerlogos.com/ice.com', 'Financial Services', 'NYSE', true),
('CME', 'CME Group Inc.', 'CME그룹', 'CMEㄱㄹ', 'https://cdn.tickerlogos.com/cmegroup.com', 'Financial Services', 'NASDAQ', true),

-- ============================================================
-- S&P 500 — Healthcare
-- ============================================================
('UNH', 'UnitedHealth Group', '유나이티드헬스', 'ㅇㄴㅇㅌㄷㅎㅅ', 'https://cdn.tickerlogos.com/unitedhealthgroup.com', 'Healthcare', 'NYSE', true),
('LLY', 'Eli Lilly and Company', '일라이릴리', 'ㅇㄹㅇㄹㄹ', 'https://cdn.tickerlogos.com/lilly.com', 'Healthcare', 'NYSE', true),
('JNJ', 'Johnson & Johnson', '존슨앤존슨', 'ㅈㅅㅇㅈㅅ', 'https://cdn.tickerlogos.com/jnj.com', 'Healthcare', 'NYSE', true),
('ABBV', 'AbbVie Inc.', '애브비', 'ㅇㅂㅂ', 'https://cdn.tickerlogos.com/abbvie.com', 'Healthcare', 'NYSE', true),
('MRK', 'Merck & Co. Inc.', '머크', 'ㅁㅋ', 'https://cdn.tickerlogos.com/merck.com', 'Healthcare', 'NYSE', true),
('TMO', 'Thermo Fisher Scientific', '써모피셔', 'ㅆㅁㅍㅅ', 'https://cdn.tickerlogos.com/thermofisher.com', 'Healthcare', 'NYSE', true),
('ABT', 'Abbott Laboratories', '애보트', 'ㅇㅂㅌ', 'https://cdn.tickerlogos.com/abbott.com', 'Healthcare', 'NYSE', true),
('DHR', 'Danaher Corporation', '다나허', 'ㄷㄴㅎ', 'https://cdn.tickerlogos.com/danaher.com', 'Healthcare', 'NYSE', true),
('PFE', 'Pfizer Inc.', '화이자', 'ㅎㅇㅈ', 'https://cdn.tickerlogos.com/pfizer.com', 'Healthcare', 'NYSE', true),
('ISRG', 'Intuitive Surgical Inc.', '인튜이티브서지컬', 'ㅇㅌㅇㅌㅂㅅㅈㅋ', 'https://cdn.tickerlogos.com/intuitive.com', 'Healthcare', 'NASDAQ', true),
('AMGN', 'Amgen Inc.', '암젠', 'ㅇㅈ', 'https://cdn.tickerlogos.com/amgen.com', 'Healthcare', 'NASDAQ', true),
('GILD', 'Gilead Sciences', '길리어드', 'ㄱㄹㅇㄷ', 'https://cdn.tickerlogos.com/gilead.com', 'Healthcare', 'NASDAQ', true),
('VRTX', 'Vertex Pharmaceuticals', '버텍스', 'ㅂㅌㅅ', 'https://cdn.tickerlogos.com/vrtx.com', 'Healthcare', 'NASDAQ', true),
('REGN', 'Regeneron Pharmaceuticals', '리제네론', 'ㄹㅈㄴㄹ', 'https://cdn.tickerlogos.com/regeneron.com', 'Healthcare', 'NASDAQ', true),
('BMY', 'Bristol-Myers Squibb', '브리스톨마이어스', 'ㅂㄹㅅㅌㅁㅇㅇㅅ', 'https://cdn.tickerlogos.com/bms.com', 'Healthcare', 'NYSE', true),
('SYK', 'Stryker Corporation', '스트라이커', 'ㅅㅌㄹㅇㅋ', 'https://cdn.tickerlogos.com/stryker.com', 'Healthcare', 'NYSE', true),
('MDT', 'Medtronic plc', '메드트로닉', 'ㅁㄷㅌㄹㄴ', 'https://cdn.tickerlogos.com/medtronic.com', 'Healthcare', 'NYSE', true),
('ELV', 'Elevance Health', '엘리번스헬스', 'ㅇㄹㅂㅅㅎㅅ', 'https://cdn.tickerlogos.com/elevancehealth.com', 'Healthcare', 'NYSE', true),
('CI', 'The Cigna Group', '시그나', 'ㅅㄱㄴ', 'https://cdn.tickerlogos.com/thecignagroup.com', 'Healthcare', 'NYSE', true),
('ZTS', 'Zoetis Inc.', '조에티스', 'ㅈㅇㅌㅅ', 'https://cdn.tickerlogos.com/zoetis.com', 'Healthcare', 'NYSE', true),
('NVO', 'Novo Nordisk A/S', '노보노디스크', 'ㄴㅂㄴㄷㅅㅋ', 'https://cdn.tickerlogos.com/novonordisk.com', 'Healthcare', 'NYSE', true),

-- ============================================================
-- S&P 500 — Consumer
-- ============================================================
('WMT', 'Walmart Inc.', '월마트', 'ㅇㅁㅌ', 'https://cdn.tickerlogos.com/walmart.com', 'Consumer Defensive', 'NYSE', true),
('PG', 'Procter & Gamble Co.', 'P&G', NULL, 'https://cdn.tickerlogos.com/pg.com', 'Consumer Defensive', 'NYSE', true),
('KO', 'The Coca-Cola Company', '코카콜라', 'ㅋㅋㅋㄹ', 'https://cdn.tickerlogos.com/coca-cola.com', 'Consumer Defensive', 'NYSE', true),
('PEP', 'PepsiCo Inc.', '펩시코', 'ㅍㅅㅋ', 'https://cdn.tickerlogos.com/pepsico.com', 'Consumer Defensive', 'NASDAQ', true),
('COST', 'Costco Wholesale Corp.', '코스트코', 'ㅋㅅㅌㅋ', 'https://cdn.tickerlogos.com/costco.com', 'Consumer Defensive', 'NASDAQ', true),
('PM', 'Philip Morris International', '필립모리스', 'ㅍㄹㅁㄹㅅ', 'https://cdn.tickerlogos.com/pmi.com', 'Consumer Defensive', 'NYSE', true),
('MDLZ', 'Mondelez International', '몬델리즈', 'ㅁㄷㄹㅈ', 'https://cdn.tickerlogos.com/mondelezinternational.com', 'Consumer Defensive', 'NASDAQ', true),
('MO', 'Altria Group Inc.', '알트리아', 'ㅇㅌㄹㅇ', 'https://cdn.tickerlogos.com/altria.com', 'Consumer Defensive', 'NYSE', true),
('CL', 'Colgate-Palmolive', '콜게이트팜올리브', 'ㅋㄱㅇㅌㅍㅇㄹㅂ', 'https://cdn.tickerlogos.com/colgatepalmolive.com', 'Consumer Defensive', 'NYSE', true),
('KHC', 'Kraft Heinz Co.', '크래프트하인즈', 'ㅋㄹㅍㅌㅎㅇㅈ', 'https://cdn.tickerlogos.com/kraftheinzcompany.com', 'Consumer Defensive', 'NASDAQ', true),
('STZ', 'Constellation Brands', '컨스텔레이션', 'ㅋㅅㅌㄹㅇㅅ', 'https://cdn.tickerlogos.com/cbrands.com', 'Consumer Defensive', 'NYSE', true),
('HD', 'The Home Depot Inc.', '홈디포', 'ㅎㄷㅍ', 'https://cdn.tickerlogos.com/homedepot.com', 'Consumer Cyclical', 'NYSE', true),
('MCD', 'McDonald''s Corporation', '맥도날드', 'ㅁㄷㄴㄷ', 'https://cdn.tickerlogos.com/mcdonalds.com', 'Consumer Cyclical', 'NYSE', true),
('NKE', 'Nike Inc.', '나이키', 'ㄴㅇㅋ', 'https://cdn.tickerlogos.com/nike.com', 'Consumer Cyclical', 'NYSE', true),
('LOW', 'Lowe''s Companies Inc.', '로우스', 'ㄹㅇㅅ', 'https://cdn.tickerlogos.com/lowes.com', 'Consumer Cyclical', 'NYSE', true),
('SBUX', 'Starbucks Corporation', '스타벅스', 'ㅅㅌㅂㅅ', 'https://cdn.tickerlogos.com/starbucks.com', 'Consumer Cyclical', 'NASDAQ', true),
('BKNG', 'Booking Holdings Inc.', '부킹홀딩스', 'ㅂㅋㅎㄷㅅ', 'https://cdn.tickerlogos.com/booking.com', 'Consumer Cyclical', 'NASDAQ', true),
('ABNB', 'Airbnb Inc.', '에어비앤비', 'ㅇㅇㅂㅇㅂ', 'https://cdn.tickerlogos.com/airbnb.com', 'Consumer Cyclical', 'NASDAQ', true),
('RIVN', 'Rivian Automotive Inc.', '리비안', 'ㄹㅂㅇ', 'https://cdn.tickerlogos.com/rivian.com', 'Consumer Cyclical', 'NASDAQ', true),
('TJX', 'TJX Companies Inc.', 'TJX', NULL, 'https://cdn.tickerlogos.com/tjx.com', 'Consumer Cyclical', 'NYSE', true),
('ORLY', 'O''Reilly Automotive', '오라일리', 'ㅇㄹㅇㄹ', 'https://cdn.tickerlogos.com/oreillyauto.com', 'Consumer Cyclical', 'NASDAQ', true),
('CMG', 'Chipotle Mexican Grill', '치폴레', 'ㅊㅍㄹ', 'https://cdn.tickerlogos.com/chipotle.com', 'Consumer Cyclical', 'NYSE', true),
('LULU', 'Lululemon Athletica', '룰루레몬', 'ㄹㄹㄹㅁ', 'https://cdn.tickerlogos.com/lululemon.com', 'Consumer Cyclical', 'NASDAQ', true),
('GM', 'General Motors Co.', '제너럴모터스', 'ㅈㄴㄹㅁㅌㅅ', 'https://cdn.tickerlogos.com/gm.com', 'Consumer Cyclical', 'NYSE', true),
('F', 'Ford Motor Company', '포드', 'ㅍㄷ', 'https://cdn.tickerlogos.com/ford.com', 'Consumer Cyclical', 'NYSE', true),
('LCID', 'Lucid Group Inc.', '루시드', 'ㄹㅅㄷ', 'https://cdn.tickerlogos.com/lucidmotors.com', 'Consumer Cyclical', 'NASDAQ', true),

-- ============================================================
-- S&P 500 — Communication Services
-- ============================================================
('NFLX', 'Netflix Inc.', '넷플릭스', 'ㄴㅍㄹㅅ', 'https://cdn.tickerlogos.com/netflix.com', 'Communication Services', 'NASDAQ', true),
('DIS', 'The Walt Disney Company', '디즈니', 'ㄷㅈㄴ', 'https://cdn.tickerlogos.com/disney.com', 'Communication Services', 'NYSE', true),
('CMCSA', 'Comcast Corporation', '컴캐스트', 'ㅋㅋㅅㅌ', 'https://cdn.tickerlogos.com/comcast.com', 'Communication Services', 'NASDAQ', true),
('VZ', 'Verizon Communications', '버라이즌', 'ㅂㄹㅇㅈ', 'https://cdn.tickerlogos.com/verizon.com', 'Communication Services', 'NYSE', true),
('T', 'AT&T Inc.', 'AT&T', NULL, 'https://cdn.tickerlogos.com/att.com', 'Communication Services', 'NYSE', true),
('SNAP', 'Snap Inc.', '스냅', 'ㅅㄴ', 'https://cdn.tickerlogos.com/snap.com', 'Communication Services', 'NYSE', true),
('RBLX', 'Roblox Corporation', '로블록스', 'ㄹㅂㄹㅅ', 'https://cdn.tickerlogos.com/roblox.com', 'Communication Services', 'NYSE', true),
('SPOT', 'Spotify Technology', '스포티파이', 'ㅅㅍㅌㅍㅇ', 'https://cdn.tickerlogos.com/spotify.com', 'Communication Services', 'NYSE', true),
('ROKU', 'Roku Inc.', '로쿠', 'ㄹㅋ', 'https://cdn.tickerlogos.com/roku.com', 'Communication Services', 'NASDAQ', true),
('WBD', 'Warner Bros. Discovery', '워너브라더스디스커버리', 'ㅇㄴㅂㄹㄷㅅㄷㅅㅋㅂㄹ', 'https://cdn.tickerlogos.com/wbd.com', 'Communication Services', 'NASDAQ', true),
('EA', 'Electronic Arts', '일렉트로닉아츠', 'ㅇㄹㅌㄹㄴㅇㅊ', 'https://cdn.tickerlogos.com/ea.com', 'Communication Services', 'NASDAQ', true),
('TTWO', 'Take-Two Interactive', '테이크투', 'ㅌㅇㅋㅌ', 'https://cdn.tickerlogos.com/take2games.com', 'Communication Services', 'NASDAQ', true),

-- ============================================================
-- S&P 500 — Industrials
-- ============================================================
('GE', 'GE Aerospace', 'GE에어로스페이스', 'GEㅇㅇㄹㅅㅍㅇㅅ', 'https://cdn.tickerlogos.com/geaerospace.com', 'Industrials', 'NYSE', true),
('CAT', 'Caterpillar Inc.', '캐터필러', 'ㅋㅌㅍㄹ', 'https://cdn.tickerlogos.com/caterpillar.com', 'Industrials', 'NYSE', true),
('DE', 'Deere & Company', '디어', 'ㄷㅇ', 'https://cdn.tickerlogos.com/deere.com', 'Industrials', 'NYSE', true),
('HON', 'Honeywell International', '허니웰', 'ㅎㄴㅇ', 'https://cdn.tickerlogos.com/honeywell.com', 'Industrials', 'NASDAQ', true),
('UNP', 'Union Pacific Corp.', '유니언퍼시픽', 'ㅇㄴㅇㅍㅅㅍ', 'https://cdn.tickerlogos.com/up.com', 'Industrials', 'NYSE', true),
('RTX', 'RTX Corporation', 'RTX', NULL, 'https://cdn.tickerlogos.com/rtx.com', 'Industrials', 'NYSE', true),
('BA', 'The Boeing Company', '보잉', 'ㅂㅇ', 'https://cdn.tickerlogos.com/boeing.com', 'Industrials', 'NYSE', true),
('LMT', 'Lockheed Martin Corp.', '록히드마틴', 'ㄹㅎㄷㅁㅌ', 'https://cdn.tickerlogos.com/lockheedmartin.com', 'Industrials', 'NYSE', true),
('MMM', '3M Company', '3M', NULL, 'https://cdn.tickerlogos.com/3m.com', 'Industrials', 'NYSE', true),
('UPS', 'United Parcel Service', 'UPS', NULL, 'https://cdn.tickerlogos.com/ups.com', 'Industrials', 'NYSE', true),
('FDX', 'FedEx Corporation', '페덱스', 'ㅍㄷㅅ', 'https://cdn.tickerlogos.com/fedex.com', 'Industrials', 'NYSE', true),
('GD', 'General Dynamics', '제너럴다이내믹스', 'ㅈㄴㄹㄷㅇㄴㅁㅅ', 'https://cdn.tickerlogos.com/generaldynamics.com', 'Industrials', 'NYSE', true),
('NOC', 'Northrop Grumman', '노스롭그루먼', 'ㄴㅅㄹㄱㄹㅁ', 'https://cdn.tickerlogos.com/northropgrumman.com', 'Industrials', 'NYSE', true),
('WM', 'Waste Management Inc.', '웨이스트매니지먼트', 'ㅇㅇㅅㅌㅁㄴㅈㅁㅌ', 'https://cdn.tickerlogos.com/wm.com', 'Industrials', 'NYSE', true),

-- ============================================================
-- S&P 500 — Energy
-- ============================================================
('XOM', 'Exxon Mobil Corporation', '엑손모빌', 'ㅇㅅㅁㅂ', 'https://cdn.tickerlogos.com/exxonmobil.com', 'Energy', 'NYSE', true),
('CVX', 'Chevron Corporation', '셰브론', 'ㅅㅂㄹ', 'https://cdn.tickerlogos.com/chevron.com', 'Energy', 'NYSE', true),
('COP', 'ConocoPhillips', '코노코필립스', 'ㅋㄴㅋㅍㄹㅅ', 'https://cdn.tickerlogos.com/conocophillips.com', 'Energy', 'NYSE', true),
('SLB', 'Schlumberger Ltd.', '슐룸버제', 'ㅅㄹㅂㅈ', 'https://cdn.tickerlogos.com/slb.com', 'Energy', 'NYSE', true),
('EOG', 'EOG Resources', 'EOG리소시스', 'EOGㄹㅅㅅㅅ', 'https://cdn.tickerlogos.com/eogresources.com', 'Energy', 'NYSE', true),
('OXY', 'Occidental Petroleum', '옥시덴탈', 'ㅇㅅㄷㅌ', 'https://cdn.tickerlogos.com/oxy.com', 'Energy', 'NYSE', true),

-- ============================================================
-- S&P 500 — Utilities & Real Estate
-- ============================================================
('NEE', 'NextEra Energy Inc.', '넥스트에라에너지', 'ㄴㅅㅌㅇㄹㅇㄴㅈ', 'https://cdn.tickerlogos.com/nexteraenergy.com', 'Utilities', 'NYSE', true),
('DUK', 'Duke Energy Corp.', '듀크에너지', 'ㄷㅋㅇㄴㅈ', 'https://cdn.tickerlogos.com/duke-energy.com', 'Utilities', 'NYSE', true),
('SO', 'Southern Company', '서던컴퍼니', 'ㅅㄷㅋㅍㄴ', 'https://cdn.tickerlogos.com/southerncompany.com', 'Utilities', 'NYSE', true),
('AMT', 'American Tower Corp.', '아메리칸타워', 'ㅇㅁㄹㅋㅌㅇ', 'https://cdn.tickerlogos.com/americantower.com', 'Real Estate', 'NYSE', true),
('PLD', 'Prologis Inc.', '프로로지스', 'ㅍㄹㄹㅈㅅ', 'https://cdn.tickerlogos.com/prologis.com', 'Real Estate', 'NYSE', true),
('CCI', 'Crown Castle Inc.', '크라운캐슬', 'ㅋㄹㅇㅋㅅ', 'https://cdn.tickerlogos.com/crowncastle.com', 'Real Estate', 'NYSE', true),
('EQIX', 'Equinix Inc.', '에퀴닉스', 'ㅇㅋㄴㅅ', 'https://cdn.tickerlogos.com/equinix.com', 'Real Estate', 'NASDAQ', true),
('O', 'Realty Income Corp.', '리얼티인컴', 'ㄹㅇㅌㅇㅋ', 'https://cdn.tickerlogos.com/realtyincome.com', 'Real Estate', 'NYSE', true),

-- ============================================================
-- ETF — S&P 500 Trackers
-- ============================================================
('SPY', 'SPDR S&P 500 ETF Trust', 'S&P 500 ETF', NULL, NULL, 'ETF', 'NYSE', true),
('VOO', 'Vanguard S&P 500 ETF', 'S&P 500 ETF (뱅가드)', 'S&P 500 ETF (ㅂㄱㄷ)', NULL, 'ETF', 'NYSE', true),
('IVV', 'iShares Core S&P 500 ETF', 'S&P 500 ETF (아이셰어즈)', 'S&P 500 ETF (ㅇㅇㅅㅇㅈ)', NULL, 'ETF', 'NYSE', true),
('SPLG', 'SPDR Portfolio S&P 500 ETF', 'S&P 500 ETF (저비용)', 'S&P 500 ETF (ㅈㅂㅇ)', NULL, 'ETF', 'NYSE', true),

-- ============================================================
-- ETF — NASDAQ 100 Trackers
-- ============================================================
('QQQ', 'Invesco QQQ Trust', '나스닥 100 ETF', 'ㄴㅅㄷ 100 ETF', NULL, 'ETF', 'NASDAQ', true),
('QQQM', 'Invesco NASDAQ 100 ETF', '나스닥 100 ETF (저비용)', 'ㄴㅅㄷ 100 ETF (ㅈㅂㅇ)', NULL, 'ETF', 'NASDAQ', true),

-- ============================================================
-- ETF — Leveraged (2x, 3x Bull)
-- ============================================================
('TQQQ', 'ProShares UltraPro QQQ', '나스닥 100 3배 레버리지', 'ㄴㅅㄷ 100 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NASDAQ', true),
('SOXL', 'Direxion Daily Semiconductor Bull 3X', '반도체 3배 레버리지', 'ㅂㄷㅊ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('SPXL', 'Direxion Daily S&P 500 Bull 3X', 'S&P 500 3배 레버리지', NULL, NULL, 'Leveraged ETF', 'NYSE', true),
('UPRO', 'ProShares UltraPro S&P 500', 'S&P 500 3배 레버리지 (프로셰어즈)', NULL, NULL, 'Leveraged ETF', 'NYSE', true),
('SSO', 'ProShares Ultra S&P 500', 'S&P 500 2배 레버리지', NULL, NULL, 'Leveraged ETF', 'NYSE', true),
('QLD', 'ProShares Ultra QQQ', '나스닥 100 2배 레버리지', 'ㄴㅅㄷ 100 2ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NASDAQ', true),
('TECL', 'Direxion Daily Technology Bull 3X', '기술주 3배 레버리지', 'ㄱㅅㅈ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('TNA', 'Direxion Daily Small Cap Bull 3X', '소형주 3배 레버리지', 'ㅅㅎㅈ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('FNGU', 'MicroSectors FANG+ Index 3X', 'FANG+ 3배 레버리지', NULL, NULL, 'Leveraged ETF', 'NYSE', true),
('LABU', 'Direxion Daily S&P Biotech Bull 3X', '바이오 3배 레버리지', 'ㅂㅇㅇ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('FAS', 'Direxion Daily Financial Bull 3X', '금융 3배 레버리지', 'ㄱㅇ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('CURE', 'Direxion Daily Healthcare Bull 3X', '헬스케어 3배 레버리지', 'ㅎㅅㅋㅇ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('NUGT', 'Direxion Daily Gold Miners Bull 2X', '금광 2배 레버리지', 'ㄱㄱ 2ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('NAIL', 'Direxion Daily Homebuilders Bull 3X', '주택건설 3배 레버리지', 'ㅈㅌㄱㅅ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('WANT', 'Direxion Daily Consumer Discr Bull 3X', '소비재 3배 레버리지', 'ㅅㅂㅈ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('DPST', 'Direxion Daily Regional Banks Bull 3X', '지역은행 3배 레버리지', 'ㅈㅇㅇㅎ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('BULZ', 'MicroSectors Solactive FANG & Innovation 3X', 'FANG 혁신 3배', 'FANG ㅎㅅ 3ㅂ', NULL, 'Leveraged ETF', 'NYSE', true),
('NVDL', 'GraniteShares 2x Long NVDA Daily ETF', '엔비디아 2배 레버리지', 'ㅇㅂㄷㅇ 2ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NASDAQ', true),
('TSLL', 'Direxion Daily TSLA Bull 2X', '테슬라 2배 레버리지', 'ㅌㅅㄹ 2ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NASDAQ', true),

-- ============================================================
-- ETF — Inverse (1x, 2x, 3x Bear)
-- ============================================================
('SQQQ', 'ProShares UltraPro Short QQQ', '나스닥 100 3배 인버스', 'ㄴㅅㄷ 100 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NASDAQ', true),
('SOXS', 'Direxion Daily Semiconductor Bear 3X', '반도체 3배 인버스', 'ㅂㄷㅊ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('SPXS', 'Direxion Daily S&P 500 Bear 3X', 'S&P 500 3배 인버스', NULL, NULL, 'Inverse ETF', 'NYSE', true),
('SPXU', 'ProShares UltraPro Short S&P 500', 'S&P 500 3배 인버스 (프로셰어즈)', NULL, NULL, 'Inverse ETF', 'NYSE', true),
('SH', 'ProShares Short S&P 500', 'S&P 500 1배 인버스', NULL, NULL, 'Inverse ETF', 'NYSE', true),
('PSQ', 'ProShares Short QQQ', '나스닥 100 1배 인버스', 'ㄴㅅㄷ 100 1ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NASDAQ', true),
('QID', 'ProShares UltraShort QQQ', '나스닥 100 2배 인버스', 'ㄴㅅㄷ 100 2ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NASDAQ', true),
('SDS', 'ProShares UltraShort S&P 500', 'S&P 500 2배 인버스', NULL, NULL, 'Inverse ETF', 'NYSE', true),
('FNGD', 'MicroSectors FANG+ Index -3X', 'FANG+ 3배 인버스', NULL, NULL, 'Inverse ETF', 'NYSE', true),
('LABD', 'Direxion Daily S&P Biotech Bear 3X', '바이오 3배 인버스', 'ㅂㅇㅇ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('FAZ', 'Direxion Daily Financial Bear 3X', '금융 3배 인버스', 'ㄱㅇ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('TZA', 'Direxion Daily Small Cap Bear 3X', '소형주 3배 인버스', 'ㅅㅎㅈ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('TECS', 'Direxion Daily Technology Bear 3X', '기술주 3배 인버스', 'ㄱㅅㅈ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('NVDS', 'AXS 1.25X NVDA Bear Daily ETF', '엔비디아 인버스', 'ㅇㅂㄷㅇ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NASDAQ', true),
('TSLS', 'Direxion Daily TSLA Bear 1X', '테슬라 인버스', 'ㅌㅅㄹ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NASDAQ', true),

-- ============================================================
-- ETF — Broad Market & Total Market
-- ============================================================
('VTI', 'Vanguard Total Stock Market ETF', '미국 전체주식 ETF', 'ㅁㄱ ㅈㅊㅈㅅ ETF', NULL, 'ETF', 'NYSE', true),
('IWM', 'iShares Russell 2000 ETF', '러셀 2000 ETF', 'ㄹㅅ 2000 ETF', NULL, 'ETF', 'NYSE', true),
('DIA', 'SPDR Dow Jones Industrial Average ETF', '다우존스 ETF', 'ㄷㅇㅈㅅ ETF', NULL, 'ETF', 'NYSE', true),
('VT', 'Vanguard Total World Stock ETF', '전세계 주식 ETF', 'ㅈㅅㄱ ㅈㅅ ETF', NULL, 'ETF', 'NYSE', true),
('VXUS', 'Vanguard Total International Stock ETF', '해외 주식 ETF', 'ㅎㅇ ㅈㅅ ETF', NULL, 'ETF', 'NYSE', true),
('MDY', 'SPDR S&P MidCap 400 ETF', '미국 중형주 ETF', 'ㅁㄱ ㅈㅎㅈ ETF', NULL, 'ETF', 'NYSE', true),
('VB', 'Vanguard Small-Cap ETF', '미국 소형주 ETF', 'ㅁㄱ ㅅㅎㅈ ETF', NULL, 'ETF', 'NYSE', true),
('EFA', 'iShares MSCI EAFE ETF', '선진국 ETF', 'ㅅㅈㄱ ETF', NULL, 'ETF', 'NYSE', true),
('EEM', 'iShares MSCI Emerging Markets ETF', '신흥국 ETF', 'ㅅㅎㄱ ETF', NULL, 'ETF', 'NYSE', true),

-- ============================================================
-- ETF — Sector
-- ============================================================
('SOXX', 'iShares Semiconductor ETF', '반도체 ETF', 'ㅂㄷㅊ ETF', NULL, 'ETF', 'NASDAQ', true),
('SMH', 'VanEck Semiconductor ETF', '반도체 ETF (반에크)', 'ㅂㄷㅊ ETF (ㅂㅇㅋ)', NULL, 'ETF', 'NASDAQ', true),
('XLK', 'Technology Select Sector SPDR', '기술 섹터 ETF', 'ㄱㅅ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLF', 'Financial Select Sector SPDR', '금융 섹터 ETF', 'ㄱㅇ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLE', 'Energy Select Sector SPDR', '에너지 섹터 ETF', 'ㅇㄴㅈ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLV', 'Health Care Select Sector SPDR', '헬스케어 섹터 ETF', 'ㅎㅅㅋㅇ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLI', 'Industrial Select Sector SPDR', '산업재 섹터 ETF', 'ㅅㅇㅈ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLY', 'Consumer Discretionary Select SPDR', '임의소비재 섹터 ETF', 'ㅇㅇㅅㅂㅈ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLP', 'Consumer Staples Select SPDR', '필수소비재 섹터 ETF', 'ㅍㅅㅅㅂㅈ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLB', 'Materials Select Sector SPDR', '소재 섹터 ETF', 'ㅅㅈ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLU', 'Utilities Select Sector SPDR', '유틸리티 섹터 ETF', 'ㅇㅌㄹㅌ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLRE', 'Real Estate Select Sector SPDR', '부동산 섹터 ETF', 'ㅂㄷㅅ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('XLC', 'Communication Services Select SPDR', '커뮤니케이션 섹터 ETF', 'ㅋㅁㄴㅋㅇㅅ ㅅㅌ ETF', NULL, 'ETF', 'NYSE', true),
('ARKK', 'ARK Innovation ETF', 'ARK 이노베이션 ETF', 'ARK ㅇㄴㅂㅇㅅ ETF', NULL, 'ETF', 'NYSE', true),
('ARKW', 'ARK Next Generation Internet ETF', 'ARK 차세대 인터넷 ETF', 'ARK ㅊㅅㄷ ㅇㅌㄴ ETF', NULL, 'ETF', 'NYSE', true),
('ARKG', 'ARK Genomic Revolution ETF', 'ARK 유전체 혁명 ETF', 'ARK ㅇㅈㅊ ㅎㅁ ETF', NULL, 'ETF', 'NYSE', true),
('ARKF', 'ARK Fintech Innovation ETF', 'ARK 핀테크 ETF', 'ARK ㅍㅌㅋ ETF', NULL, 'ETF', 'NYSE', true),

-- ============================================================
-- ETF — Bond & Income
-- ============================================================
('TLT', 'iShares 20+ Year Treasury Bond ETF', '미국 장기국채 ETF', 'ㅁㄱ ㅈㄱㄱㅊ ETF', NULL, 'ETF', 'NASDAQ', true),
('TMF', 'Direxion Daily 20+ Yr Treasury Bull 3X', '장기국채 3배 레버리지', 'ㅈㄱㄱㅊ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('TMV', 'Direxion Daily 20+ Yr Treasury Bear 3X', '장기국채 3배 인버스', 'ㅈㄱㄱㅊ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('TBT', 'ProShares UltraShort 20+ Yr Treasury', '장기국채 2배 인버스', 'ㅈㄱㄱㅊ 2ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('BND', 'Vanguard Total Bond Market ETF', '미국 채권 ETF', 'ㅁㄱ ㅊㄱ ETF', NULL, 'ETF', 'NASDAQ', true),
('AGG', 'iShares Core U.S. Aggregate Bond ETF', '미국 종합채권 ETF', 'ㅁㄱ ㅈㅎㅊㄱ ETF', NULL, 'ETF', 'NYSE', true),
('HYG', 'iShares iBoxx High Yield Corporate Bond', '하이일드 회사채 ETF', 'ㅎㅇㅇㄷ ㅎㅅㅊ ETF', NULL, 'ETF', 'NYSE', true),
('LQD', 'iShares iBoxx Investment Grade Bond', '투자등급 회사채 ETF', 'ㅌㅈㄷㄱ ㅎㅅㅊ ETF', NULL, 'ETF', 'NYSE', true),
('SHY', 'iShares 1-3 Year Treasury Bond ETF', '미국 단기국채 ETF', 'ㅁㄱ ㄷㄱㄱㅊ ETF', NULL, 'ETF', 'NASDAQ', true),
('IEF', 'iShares 7-10 Year Treasury Bond ETF', '미국 중기국채 ETF', 'ㅁㄱ ㅈㄱㄱㅊ ETF', NULL, 'ETF', 'NASDAQ', true),
('TIP', 'iShares TIPS Bond ETF', '물가연동채 ETF', 'ㅁㄱㅇㄷㅊ ETF', NULL, 'ETF', 'NYSE', true),

-- ============================================================
-- ETF — Commodity & Gold
-- ============================================================
('GLD', 'SPDR Gold Shares', '금 ETF', 'ㄱ ETF', NULL, 'ETF', 'NYSE', true),
('GDX', 'VanEck Gold Miners ETF', '금광기업 ETF', 'ㄱㄱㄱㅇ ETF', NULL, 'ETF', 'NYSE', true),
('SLV', 'iShares Silver Trust', '은 ETF', 'ㅇ ETF', NULL, 'ETF', 'NYSE', true),
('IAU', 'iShares Gold Trust', '금 ETF (아이셰어즈)', 'ㄱ ETF (ㅇㅇㅅㅇㅈ)', NULL, 'ETF', 'NYSE', true),
('USO', 'United States Oil Fund', '원유 ETF', 'ㅇㅇ ETF', NULL, 'ETF', 'NYSE', true),
('UNG', 'United States Natural Gas Fund', '천연가스 ETF', 'ㅊㅇㄱㅅ ETF', NULL, 'ETF', 'NYSE', true),
('BOIL', 'ProShares Ultra Bloomberg Natural Gas', '천연가스 2배 레버리지', 'ㅊㅇㄱㅅ 2ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('KOLD', 'ProShares UltraShort Bloomberg Natural Gas', '천연가스 2배 인버스', 'ㅊㅇㄱㅅ 2ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),

-- ============================================================
-- ETF — Volatility
-- ============================================================
('UVXY', 'ProShares Ultra VIX Short-Term Futures', 'VIX 1.5배 레버리지', NULL, NULL, 'Leveraged ETF', 'CBOE', true),
('SVXY', 'ProShares Short VIX Short-Term Futures', 'VIX 인버스', NULL, NULL, 'Inverse ETF', 'CBOE', true),
('VXX', 'iPath Series B S&P 500 VIX Short-Term', 'VIX ETN', NULL, NULL, 'ETF', 'CBOE', true),

-- ============================================================
-- ETF — Dividend & Income Focused
-- ============================================================
('SCHD', 'Schwab U.S. Dividend Equity ETF', '미국 배당 ETF', 'ㅁㄱ ㅂㄷ ETF', NULL, 'ETF', 'NYSE', true),
('VYM', 'Vanguard High Dividend Yield ETF', '고배당 ETF', 'ㄱㅂㄷ ETF', NULL, 'ETF', 'NYSE', true),
('DVY', 'iShares Select Dividend ETF', '배당 셀렉트 ETF', 'ㅂㄷ ㅅㄹㅌ ETF', NULL, 'ETF', 'NASDAQ', true),
('JEPI', 'JPMorgan Equity Premium Income ETF', 'JP모건 프리미엄인컴 ETF', 'JPㅁㄱ ㅍㄹㅁㅇㅇㅋ ETF', NULL, 'ETF', 'NYSE', true),
('JEPQ', 'JPMorgan NASDAQ Equity Premium Income', 'JP모건 나스닥 프리미엄인컴', 'JPㅁㄱ ㄴㅅㄷ ㅍㄹㅁㅇㅇㅋ', NULL, 'ETF', 'NASDAQ', true),
('QYLD', 'Global X NASDAQ 100 Covered Call ETF', '나스닥 커버드콜 ETF', 'ㄴㅅㄷ ㅋㅂㄷㅋ ETF', NULL, 'ETF', 'NASDAQ', true),
('XYLD', 'Global X S&P 500 Covered Call ETF', 'S&P 500 커버드콜 ETF', NULL, NULL, 'ETF', 'NYSE', true),

-- ============================================================
-- Additional popular / meme stocks
-- ============================================================
('ENPH', 'Enphase Energy Inc.', '엔페이즈에너지', 'ㅇㅍㅇㅈㅇㄴㅈ', 'https://cdn.tickerlogos.com/enphase.com', 'Technology', 'NASDAQ', true),
('SEDG', 'SolarEdge Technologies', '솔라엣지', 'ㅅㄹㅇㅈ', 'https://cdn.tickerlogos.com/solaredge.com', 'Technology', 'NASDAQ', true),
('GME', 'GameStop Corp.', '게임스탑', 'ㄱㅇㅅㅌ', 'https://cdn.tickerlogos.com/gamestop.com', 'Consumer Cyclical', 'NYSE', true),
('AMC', 'AMC Entertainment Holdings', 'AMC엔터테인먼트', 'AMCㅇㅌㅌㅇㅁㅌ', 'https://cdn.tickerlogos.com/amctheatres.com', 'Communication Services', 'NYSE', true),
('HOOD', 'Robinhood Markets Inc.', '로빈후드', 'ㄹㅂㅎㄷ', 'https://cdn.tickerlogos.com/robinhood.com', 'Financial Services', 'NASDAQ', true),
('MARA', 'Marathon Digital Holdings', '마라톤디지털', 'ㅁㄹㅌㄷㅈㅌ', 'https://cdn.tickerlogos.com/mara.com', 'Financial Services', 'NASDAQ', true),
('RIOT', 'Riot Platforms Inc.', '라이엇', 'ㄹㅇㅇ', 'https://cdn.tickerlogos.com/riotplatforms.com', 'Financial Services', 'NASDAQ', true),
('MSTR', 'MicroStrategy Inc.', '마이크로스트래티지', 'ㅁㅇㅋㄹㅅㅌㄹㅌㅈ', 'https://cdn.tickerlogos.com/microstrategy.com', 'Technology', 'NASDAQ', true),
('CELH', 'Celsius Holdings Inc.', '셀시우스', 'ㅅㅅㅇㅅ', 'https://cdn.tickerlogos.com/celsius.com', 'Consumer Defensive', 'NASDAQ', true),
('IONQ', 'IonQ Inc.', '아이온큐', 'ㅇㅇㅇㅋ', 'https://cdn.tickerlogos.com/ionq.com', 'Technology', 'NYSE', true),
('RGTI', 'Rigetti Computing', '리게티컴퓨팅', 'ㄹㄱㅌㅋㅍㅌ', 'https://cdn.tickerlogos.com/rigetti.com', 'Technology', 'NASDAQ', true),
('QUBT', 'Quantum Computing Inc.', '퀀텀컴퓨팅', 'ㅋㅌㅋㅍㅌ', 'https://cdn.tickerlogos.com/quantumcomputinginc.com', 'Technology', 'NASDAQ', true),
('JOBY', 'Joby Aviation Inc.', '조비에비에이션', 'ㅈㅂㅇㅂㅇㅇㅅ', 'https://cdn.tickerlogos.com/jobyaviation.com', 'Industrials', 'NYSE', true),
('ACHR', 'Archer Aviation Inc.', '아처에비에이션', 'ㅇㅊㅇㅂㅇㅇㅅ', 'https://cdn.tickerlogos.com/archer.com', 'Industrials', 'NYSE', true),
('RKLB', 'Rocket Lab USA Inc.', '로켓랩', 'ㄹㅋㄹ', 'https://cdn.tickerlogos.com/rocketlabusa.com', 'Industrials', 'NASDAQ', true),

-- ============================================================
-- China / International ADRs
-- ============================================================
('BABA', 'Alibaba Group Holding', '알리바바', 'ㅇㄹㅂㅂ', 'https://cdn.tickerlogos.com/alibabagroup.com', 'Consumer Cyclical', 'NYSE', true),
('PDD', 'PDD Holdings Inc.', '핀둬둬', 'ㅍㄷㄷ', 'https://cdn.tickerlogos.com/pinduoduo.com', 'Consumer Cyclical', 'NASDAQ', true),
('JD', 'JD.com Inc.', '징동닷컴', 'ㅈㄷㄷㅋ', 'https://cdn.tickerlogos.com/jd.com', 'Consumer Cyclical', 'NASDAQ', true),
('BIDU', 'Baidu Inc.', '바이두', 'ㅂㅇㄷ', 'https://cdn.tickerlogos.com/baidu.com', 'Communication Services', 'NASDAQ', true),
('NIO', 'NIO Inc.', '니오', 'ㄴㅇ', 'https://cdn.tickerlogos.com/nio.com', 'Consumer Cyclical', 'NYSE', true),
('XPEV', 'XPeng Inc.', '샤오펑', 'ㅅㅇㅍ', 'https://cdn.tickerlogos.com/xpeng.com', 'Consumer Cyclical', 'NYSE', true),
('LI', 'Li Auto Inc.', '리오토', 'ㄹㅇㅌ', 'https://cdn.tickerlogos.com/lixiang.com', 'Consumer Cyclical', 'NASDAQ', true),
('TSM', 'Taiwan Semiconductor Mfg.', 'TSMC', NULL, 'https://cdn.tickerlogos.com/tsmc.com', 'Technology', 'NYSE', true),
('ASML', 'ASML Holding N.V.', 'ASML', NULL, 'https://cdn.tickerlogos.com/asml.com', 'Technology', 'NASDAQ', true),
('SAP', 'SAP SE', 'SAP', NULL, 'https://cdn.tickerlogos.com/sap.com', 'Technology', 'NYSE', true),
('TM', 'Toyota Motor Corp.', '토요타', 'ㅌㅇㅌ', 'https://cdn.tickerlogos.com/toyota.com', 'Consumer Cyclical', 'NYSE', true),
('SONY', 'Sony Group Corp.', '소니', 'ㅅㄴ', 'https://cdn.tickerlogos.com/sony.com', 'Technology', 'NYSE', true),
('MELI', 'MercadoLibre Inc.', '메르카도리브레', 'ㅁㄹㅋㄷㄹㅂㄹ', 'https://cdn.tickerlogos.com/mercadolibre.com', 'Consumer Cyclical', 'NASDAQ', true),
('SE', 'Sea Limited', '씨리미티드', 'ㅆㄹㅁㅌㄷ', 'https://cdn.tickerlogos.com/sea.com', 'Consumer Cyclical', 'NYSE', true),
('GRAB', 'Grab Holdings Ltd.', '그랩', 'ㄱㄹ', 'https://cdn.tickerlogos.com/grab.com', 'Technology', 'NASDAQ', true),

-- ============================================================
-- China / EM Leveraged ETFs
-- ============================================================
('YINN', 'Direxion Daily FTSE China Bull 3X', '중국 3배 레버리지', 'ㅈㄱ 3ㅂ ㄹㅂㄹㅈ', NULL, 'Leveraged ETF', 'NYSE', true),
('YANG', 'Direxion Daily FTSE China Bear 3X', '중국 3배 인버스', 'ㅈㄱ 3ㅂ ㅇㅂㅅ', NULL, 'Inverse ETF', 'NYSE', true),
('FXI', 'iShares China Large-Cap ETF', '중국 대형주 ETF', 'ㅈㄱ ㄷㅎㅈ ETF', NULL, 'ETF', 'NYSE', true),
('KWEB', 'KraneShares CSI China Internet ETF', '중국 인터넷 ETF', 'ㅈㄱ ㅇㅌㄴ ETF', NULL, 'ETF', 'NYSE', true);

-- Fix trade_images.data column type for large image uploads
ALTER TABLE trade_images MODIFY COLUMN data LONGBLOB NOT NULL;
