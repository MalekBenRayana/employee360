// import { Injectable } from '@nestjs/common';
// import { AutoModel, AutoTokenizer } from '@huggingface/transformers';
// import * as tf from '@tensorflow/tfjs';

// @Injectable()
// export class AiEvaluationService {
//   private model: any;
//   private tokenizer: any;
//   private modelName = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2";

//   constructor() {
//     this.initializeModel();
//   }

//   async initializeModel() {
//     try {
//       this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
//       this.model = await AutoModel.from_pretrained(this.modelName);
//       this.model.eval();
//       console.log('Modèle d\'embeddings chargé avec succès.');
//     } catch (error) {
//       console.error('Erreur lors du chargement du modèle d\'embeddings:', error);
//       throw new Error('Impossible de charger le modèle d\'embeddings.');
//     }
//   }

//   async encodeText(text: string) {
//     try {
//       const inputs = await this.tokenizer(text, {
//         return_tensors: 'pt',
//         truncation: true,
//         max_length: 512,
//         padding: 'max_length',
//       });
//       const outputs = await this.model(inputs.input_ids, inputs.attention_mask);
//       // Récupérer l'embedding de la phrase (la moyenne des embeddings des tokens - méthode courante)
//       const embeddings = outputs.pooler_output;
//       return embeddings.data(); // Retourner les données du tenseur
//     } catch (error) {
//       console.error('Erreur lors de l\'encodage du texte:', error);
//       return null;
//     }
//   }

// async cosineSimilarity(embeddingA: number[], embeddingB: number[]): Promise<number> {
//     try {
//       const tensorA = tf.tensor1d(embeddingA);
//       const tensorB = tf.tensor1d(embeddingB);

//       // Calcul de la norme (magnitude) des vecteurs
//       const normA = tf.sqrt(tf.sum(tf.square(tensorA)));
//       const normB = tf.sqrt(tf.sum(tf.square(tensorB)));

//       // Calcul du produit scalaire (dot product)
//       const dotProduct = tf.sum(tf.mul(tensorA, tensorB));

//       // Calcul de la similarité cosinus
//       const similarityTensor = tf.div(dotProduct, tf.mul(normA, normB));
//       return similarityTensor.dataSync()[0];

//     } catch (error) {
//       console.error('Erreur lors du calcul de la similarité cosinus:', error);
//       return 0;
//     }
//   }

//   async evaluateText(userAnswer: string, referenceEmbeddings: number[][]): Promise<number | null> {
//     try {
//       if (!this.tokenizer || !this.model) {
//         console.warn('Le modèle d\'embeddings n\'est pas encore initialisé.');
//         return null;
//       }

//       const userAnswerEmbedding = await this.encodeText(userAnswer);
//       if (!userAnswerEmbedding) {
//         return null;
//       }

//       let maxSimilarity = 0;

//       for (const refEmbedding of referenceEmbeddings) {
//         const similarity = await this.cosineSimilarity(userAnswerEmbedding, refEmbedding);
//         maxSimilarity = Math.max(maxSimilarity, similarity);
//       }

//       // Interpréter la similarité pour obtenir une note (ajuster cette logique !)
//       if (maxSimilarity > 0.8) {
//         return 5;
//       } else if (maxSimilarity > 0.6) {
//         return 4;
//       } else if (maxSimilarity > 0.4) {
//         return 3;
//       } else if (maxSimilarity > 0.2) {
//         return 2;
//       } else {
//         return 1;
//       }

//     } catch (error) {
//       console.error('Erreur lors de l\'évaluation du texte par similarité:', error);
//       return null;
//     }
//   }

//   // Méthode pour générer les embeddings des références (à appeler au préalable)
//   async generateReferenceEmbeddings(referenceTexts: string[]): Promise<number[][]> {
//     const embeddings: number[][] = [];
//     for (const text of referenceTexts) {
//       const embedding = await this.encodeText(text);
//       if (embedding) {
//         embeddings.push(embedding);
//       }
//     }
//     return embeddings;
//   }
// }
