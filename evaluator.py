from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate,SystemMessagePromptTemplate,HumanMessagePromptTemplate
from datetime import datetime
from pydantic import BaseModel
from typing import List

import re ,json

llm=ChatGoogleGenerativeAI(model='gemini-2.5-flash',api_key="AIzaSyA8Tv_4hjsxgz2XivgdTUYDwb09XFrSgFg")
class Evaluation(BaseModel):
    Mistakes: List[str]
    Rating: int
    Areas_to_Improve: List[str]
    Feedback: str
system_prompt = SystemMessagePromptTemplate.from_template(
"""
You are an expert technical evaluator.

Your task is to evaluate a My answer to a given question.

Evaluation Instructions:
1. Carefully compare the My answer with the expected concepts.
2. Identify incorrect statements, missing concepts, or weak explanations.
3. Judge the answer based on:
   - Correctness
   - Completeness
   - Clarity of explanation
4. Be objective and constructive in your feedback.
5. Strictly ignore typos.

Scoring Guide:
10 = Perfect answer with complete explanation  
8-9 = Correct answer with minor missing details  
6-7 = Partially correct but missing important concepts  
4-5 = Significant gaps in understanding  
1-3 = Mostly incorrect or irrelevant answer  

Output Requirements (VERY IMPORTANT):

- The response MUST be valid JSON.
- Do NOT include explanations outside JSON.
- Each item in "Mistakes" MUST be a STRING.
- Do NOT use objects inside the Mistakes list.

Return the evaluation strictly in the following format:

{{
  "Mistakes": [
    "mistake 1",
    "mistake 2",
    "mistake 3"
  ],
  "Rating": 0,
  "Areas_to_Improve": [
    "topic 1",
    "topic 2"
  ],
  "Feedback": "constructive feedback here"
}}

Return ONLY valid JSON.
"""
)
human_prompt = HumanMessagePromptTemplate.from_template(
"""
User_response:{user_responses}
"""
)
chat_prompt = ChatPromptTemplate.from_messages(
    [system_prompt, human_prompt]
)
chain = chat_prompt | llm
start=datetime.now()

def evaluate_responses(responses, api_key):

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=api_key
    )
    structured_llm = llm.with_structured_output(Evaluation)

    chain = chat_prompt | structured_llm

    # response = chain.invoke({"user_responses":responses})
    response = chain.invoke({"user_responses": responses})
    # text = response.content

    # clean = re.sub(r"```json|```", "", text).strip()

    # data = json.loads(clean)
    data = response.model_dump()
    print(data["Mistakes"])
    print(data["Rating"])

    return data






