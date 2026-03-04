-- Run this after schema.sql to seed the public feed
-- Gives new visitors something to react to immediately

insert into roasts (category, roast, fix, score, one_liner, subscores, savage_mode, display_name, reactions, crowd_score) values

('LinkedIn Bio',
'You''ve opened with "Passionate about people and process" which means you couldn''t think of a single concrete thing you''ve done. The phrase "driving outcomes" appears twice, separated by "leveraging synergies," forming a sentence that technically contains words. You''ve listed yourself as a "thought leader" with 47 connections, 23 of whom are your cousins. The open to work banner has been up so long it''s structural.',
'Pick the one thing you''re proudest of professionally. Write one sentence. Put it first. Delete everything else.',
9,
'A human LinkedIn written by a LinkedIn algorithm having a fever dream.',
''{"creativity": 9, "brutality": 9, "accuracy": 8}'',
false, 'The Algorithm',
''{"💀":89,"🔥":67,"🤌":44,"😬":12,"🫡":5,"😭":55}'',
8.4),

('Dating Profile',
'You''ve described yourself as "fluent in sarcasm" which is the written equivalent of saying your personality is a coping mechanism. You enjoy "adventures but also staying in," narrowing your target demographic to everyone alive. Your height is in the bio but your emotional availability is not. The dog in your third photo is doing more work than you are.',
'Say one specific weird true thing about yourself. That is the entire profile.',
7,
'The written equivalent of a firm handshake from someone wearing too much cologne.',
''{"creativity": 8, "brutality": 7, "accuracy": 9}'',
false, 'SwipeLeft4Ever',
''{"💀":55,"🔥":102,"🤌":38,"😬":67,"🫡":3,"😭":88}'',
8.1),

('Business Pitch',
'You''ve invented a marketplace for marketplaces, disrupting the critical problem of disruption not being sufficiently disrupted. Your TAM is "everyone with a phone." Your moat is "first mover advantage" in a space with fourteen competitors you listed on slide 3. The word blockchain appears four times. This is a dog walking app.',
'Describe what your product does to a tired parent at 6pm who has never heard of you. If they don''t get it, start over.',
10,
'Uber but for Uber. Disrupting disruption itself.',
''{"creativity": 10, "brutality": 10, "accuracy": 9}'',
false, 'Y Combinator Reject',
''{"💀":201,"🔥":178,"🤌":155,"😬":8,"🫡":2,"😭":33}'',
9.2),

('Cover Letter',
'You''ve opened with "I am writing to express my interest," a sentence that has caused zero hiring managers to feel anything since 1987. You claim to be detail-oriented while addressing this letter to "Whom It May Concern" for a company you claim to admire deeply. The phrase "I believe I would be a great fit" is pulling the weight of three paragraphs of nothing.',
'First sentence: one specific thing you did that is relevant. Second sentence: why this company specifically. Stop there.',
6,
'Three paragraphs of saying nothing with tremendous confidence.',
''{"creativity": 6, "brutality": 6, "accuracy": 9}'',
false, 'Unemployed in Melbourne',
''{"💀":34,"🔥":28,"🤌":19,"😬":77,"🫡":44,"😭":22}'',
6.8),

('Social Bio',
'You''ve used all 160 characters to tell me you are a "wife, mom, dog mom, coffee addict, and lover of all things cozy." This is not a personality, it is a demographic. The sunflower emoji is working overtime. You have listed your star sign but not your values, which tells me everything.',
'One sentence about what you actually do or make or think. The rest is noise.',
7,
'A star sign and a Starbucks order dressed up as an identity.',
''{"creativity": 8, "brutality": 7, "accuracy": 8}'',
false, 'Main Character Energy',
''{"💀":66,"🔥":71,"🤌":50,"😬":29,"🫡":8,"😭":41}'',
7.9);
