import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GaRunnerService } from '../ga-runner.service';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {

    targetText: string = 'Genkit demo';
    populationSize: number = 50;
    mutationRate: number = 0.01;
    evalTypes = [
        {
            name: 'cost',
            displayName: 'cost',
            displayHtml: 'Cost based',
            selected: "true"
        },
        {
            name: 'fitness',
            displayName: 'fitness',
            displayHtml: 'Fitness based'
        }
    ];
    evalType: string;
    mutationTypes = [
        {
            name: 'up-down',
            displayName: 'up-down',
            displayHtml: 'Up-Down',
            selected: "true"
        },
        {
            name: 'random',
            displayName: 'random',
            displayHtml: 'Random'
        }
    ]
    mutationType: string;
    stepDuration: number = 1;
    status: string = 'Ready';

    constructor(private garunner: GaRunnerService) { }

    ngOnInit() {
    }

    setEvalType(t: string): void {
        this.evalType = t;
    }

    setMutationType(t: string): void {
        this.mutationType = t;
    }

    runIterations(): void {
        let config = {
            targetText: this.targetText,
            populationSize: this.populationSize,
            mutationRate: this.mutationRate,
            evalType: this.evalType,
            mutationType: this.mutationType,
            stepDuration: this.stepDuration
        }
        this.garunner.run(config);
        status = 'Started';
    }

    abortIterations(): void {
        this.garunner.abort();
    }

}

export type InputMessage = {
    targetText: string,
    populationSize: number,
    mutationRate: number,
    evalType: string,
    mutationType: string,
    stepDuration: number
}
