var h=Object.defineProperty;var m=(s,e,t)=>e in s?h(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var d=(s,e,t)=>m(s,typeof e!="symbol"?e+"":e,t);const u="https://api.deepseek.com/v1/chat/completions";class y{constructor(){d(this,"apiKey");console.warn("DeepSeek API key not configured. AI features will be disabled."),this.apiKey=""}async callDeepSeek(e,t=.7,n=2e3){if(!this.apiKey)throw new Error("DeepSeek API key is not configured. Please add VITE_DEEPSEEK_API_KEY to your environment variables.");try{const r={model:"deepseek-chat",messages:e,temperature:t,max_tokens:n,stream:!1},o=await fetch(u,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.apiKey}`},body:JSON.stringify(r)});if(!o.ok){const i=await o.text();throw console.error("DeepSeek API error:",i),new Error(`DeepSeek API error: ${o.status} - ${i}`)}const a=await o.json();if(!a.choices||a.choices.length===0)throw new Error("No response from DeepSeek API");return a.choices[0].message.content.trim()}catch(r){throw console.error("Error calling DeepSeek API:",r),r}}async polishJobDescription(e){const{companyName:t,roleTitle:n,domain:r,description:o,qualification:a,experienceRequired:i}=e,p="You are an expert HR content writer specializing in creating compelling job descriptions. Your task is to polish and enhance job descriptions to make them more attractive to candidates while maintaining accuracy and professionalism.",c=`Please polish and enhance the following job description. Make it more engaging, clear, and professional. Keep the core information accurate but improve the language, structure, and appeal.

Company: ${t}
Role: ${n}
Domain: ${r}
Experience Required: ${i||"Not specified"}
Qualification: ${a||"Not specified"}

Current Description:
${o}

Please provide an improved version that:
1. Has a compelling opening paragraph about the role
2. Clearly outlines key responsibilities
3. Lists required qualifications and skills
4. Highlights what makes this opportunity attractive
5. Uses professional yet approachable language
6. Is well-structured and easy to read

Improved Description:`;try{return await this.callDeepSeek([{role:"system",content:p},{role:"user",content:c}],.7,1500)}catch(l){throw console.error("Error polishing job description:",l),new Error("Failed to polish job description. Please try again later.")}}async generateCompanyDescription(e){const{companyName:t,roleTitle:n,domain:r,jobDescription:o,qualification:a,experienceRequired:i}=e,p="You are an expert at creating compelling company descriptions that help candidates understand what a company does and why they should apply.",c=`Create a brief, engaging company description (2-3 paragraphs, around 150-200 words) for:

Company Name: ${t}
They are hiring for: ${n} (${r})
Experience Level: ${i||"Not specified"}
Required Qualification: ${a||"Not specified"}
${o?`
Job Context:
${o.substring(0,500)}`:""}

Create a description that:
1. Explains what the company likely does based on the role and domain
2. Highlights why it's an exciting place to work
3. Mentions the kind of impact the candidate can make
4. Uses professional but friendly language
5. Is generic enough to fit most companies but specific to the role

Company Description:`;try{return await this.callDeepSeek([{role:"system",content:p},{role:"user",content:c}],.8,500)}catch(l){return console.error("Error generating company description:",l),`${t} is a dynamic organization seeking talented professionals to join their team. This ${n} position offers an excellent opportunity to work with cutting-edge technologies and contribute to impactful projects. The ideal candidate will bring their expertise in ${r} to help drive innovation and success.`}}async extractKeywords(e,t){const n="You are an expert at analyzing job descriptions and extracting key technical skills, tools, and keywords that should be highlighted in a resume for ATS optimization.",r=`Extract the most important keywords, skills, and technologies from this job description for the role of ${t}. Focus on technical skills, tools, frameworks, methodologies, and domain-specific terms that would be important for ATS (Applicant Tracking Systems).

Job Description:
${e.substring(0,2e3)}

Provide a comma-separated list of 15-25 most important keywords:`;try{return(await this.callDeepSeek([{role:"system",content:n},{role:"user",content:r}],.5,300)).split(",").map(i=>i.trim()).filter(i=>i.length>0&&i.length<50).slice(0,25)}catch(o){return console.error("Error extracting keywords:",o),[]}}async generateInterviewTips(e){const{roleTitle:t,domain:n,companyName:r,testTypes:o=[]}=e,a="You are a career coach helping candidates prepare for job interviews.",i=o.length>0?`The interview process includes: ${o.join(", ")}.`:"",p=`Provide 5-7 brief, actionable interview preparation tips for someone applying for:

Role: ${t}
Domain: ${n}
Company: ${r}
${i}

Focus on:
1. What to prepare technically
2. How to showcase relevant experience
3. Common interview topics for this domain
4. What the company might be looking for
5. How to stand out as a candidate

Keep tips concise (1-2 sentences each) and practical.

Interview Tips:`;try{return await this.callDeepSeek([{role:"system",content:a},{role:"user",content:p}],.7,700)}catch(c){return console.error("Error generating interview tips:",c),`Prepare thoroughly for your ${t} interview by reviewing core ${n} concepts, practicing common technical questions, and being ready to discuss your relevant projects and experience. Research ${r} and prepare thoughtful questions about the role and team.`}}isConfigured(){return!!this.apiKey}}const w=new y;export{w as deepseekService};
