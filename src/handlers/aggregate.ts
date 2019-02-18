import { Population, CalculationResult } from '../types';
import { invoke } from '../utils';

type EventPayload = { population: Population, generation: number }

export default async (event: EventPayload ) => {
  const { population, generation } = event;
  const result = await Promise.all(population.map(sequence =>
    invoke({
      functionName: 'calculate',
      payload: sequence
    }).catch(err => {
      console.error('failed to process', sequence, err);
      return null
    })
  )) as CalculationResult[];

  const [bestResult, ...rest] = result.filter(Boolean).sort((a, b) => a.score > b.score ? -1 : 1);
  const randomResult = rest[Math.random() * rest.length | 0];

  const winners = [bestResult, randomResult];

  return {
    statusCode: 200,
    body: JSON.stringify({
      generation,
      winners
    }),
  };
}

