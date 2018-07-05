import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { BehaviorSubject } from 'rxjs';

import * as _ from 'underscore';

// TODO: namespacing?
import {EvalType,
        Config,
        Gene,
        Population,
        randomPopulation,
        randomGene,
        evolve,
        score
       } from 'genkit';

import {dnaCodes,
        distance,
        evalFns,
        mutateFns,
        mateFns
       } from './ga-lib';

import { InputMessage } from './input/input.component';
import { GeneString, OutputMessage } from './output/output.component';

@Injectable({
  providedIn: 'root'
})
export class GaRunnerService {
    snapshot: BehaviorSubject<[Population, Gene]> = new BehaviorSubject<[Population, Gene]>([
        {
            elements: [],
            generation: 0
        },
        {
            code: [],
            score: undefined,
            fitness: undefined,
            cost: undefined
        }
    ]); // Current snapshot of evolution

    it: number; // iterator;

    output: BehaviorSubject<OutputMessage> = new BehaviorSubject({
        topGene: {
            code: '<none>',
            cost: undefined,
            fitness: undefined,
            score: undefined
        },
        elements: [],
        generation: 0
    })

    running: boolean = false;

    constructor() { }

    run(config: InputMessage): void {
        if (this.running) {
            return;
        }
        this.running = true;

        let target: Array<string> = config.targetText.split('');
        let populationSize: number = config.populationSize;
        let mutationRate: number = config.mutationRate;
        let evalFn = evalFns['cost'];
        let evalType = EvalType.ET_COST;
        if (config.evalType === 'fitness') {
            evalFn = evalFns['fitness'];
            evalType = EvalType.ET_FITNESS;
        }
        let mutateFn = mutateFns['updown'];
        if (config.mutationType === 'random') {
            mutateFn = mutateFns['random'];
        }
        let mateFn = mateFns['half-half'];
        let stepDuration: number = config.stepDuration;

        let evalFnWrapper = (str: Array<any>) => {
            return evalFn.call(this, str, target);
        }

        let gaconfig: Config = {
            dnaCodes: dnaCodes,
            evalType: evalType,
            evalFn: evalFnWrapper,
            mutate: mutateFn,
            mate: mateFn
        };

        let p = randomPopulation(gaconfig, target.length, 50);

        // Massive performance degradation due to running in
        // setInterval as compared to running in while(true) loop.
        // But we need to give control to user, so...
        this.it = window.setInterval(() => {
            let [pnext, done] = this.iterate(gaconfig,
                                             p,
                                             mutationRate);
            p = pnext;
            if (done) {
                window.clearInterval(this.it);
                this.running = false;
            }
        }, config.stepDuration || 0);
    }

    iterate(gaconfig: Config, p: Population, mutationRate: number): [Population, boolean] {
        p = score(gaconfig, p);
        p.generation = p.generation + 1;
        let tg = _.max(p.elements, (e) => e.score);
        this.snapshot.next([p, tg]);
        let done: boolean = false;

        if (this.checkConvergence(tg, gaconfig.evalType)) {
            done = true;
        }
        p = evolve(gaconfig, p, mutationRate);

        return [p, done];
    }

    checkConvergence(gene: Gene, evalType: EvalType): boolean {
        if (evalType === EvalType.ET_COST && gene.cost === 0) {
            return true;
        } else if (evalType === EvalType.ET_FITNESS && gene.fitness === 1.0) {
            return true;
        }
        return false;
    }

    abort(): void {
        if (!this.running) {
            return;
        }
        if (this.it) {
            window.clearInterval(this.it);
        }
        this.running = false;
    }

    // Relay gene information in output message format
    registerEmitter() {
        this.snapshot.subscribe(([p, gene]) => {
            let tg = this.toString(gene);
            this.output.next({
                topGene: tg,
                elements: _.map(p.elements, this.toString),
                generation: p.generation
            });
        });
    }

    toString (gene: Gene): GeneString {
        return {
            code: gene.code.join(''),
            cost: gene.cost,
            fitness: gene.fitness,
            score: gene.score
        }
    }
}

