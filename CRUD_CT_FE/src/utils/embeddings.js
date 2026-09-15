import ollama from 'ollama';

/**
 * Creates an embedding for a given record by combining its summary, description, and steps.
 * 
 * @param {Object} record - The case task record.
 * @param {string} record.issueSummary - The summary of the issue.
 * @param {string} record.issueDescription - The description of the issue.
 * @param {string} record.stepsToReproduce - The steps to reproduce the issue (could also be stepsToReplicate).
 * @param {string} [modelName='nomic-embed-text'] - The local ollama model to use for embeddings.
 * @returns {Promise<number[]>} The generated embedding vector.
 */
export async function createRecordEmbedding(record, modelName = 'nomic-embed-text') {
  const summary = record.issueSummary || '';
  const description = record.issueDescription || '';
  const steps = record.stepsToReproduce || record.stepsToReplicate || '';

  const combinedText = `${summary}\n\n${description}\n\n${steps}`.trim();

  if (!combinedText) {
    throw new Error('Record has no text to embed.');
  }

  try {
    const response = await ollama.embeddings({
      model: modelName,
      prompt: combinedText,
    });
    
    return response.embedding;
  } catch (error) {
    console.error('Error generating embedding with Ollama:', error);
    throw error;
  }
}
