import { Component, OnInit } from '@angular/core';

import { GaRunnerService } from '../ga-runner.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.css']
})
export class OutputComponent implements OnInit {

    output: OutputMessage;

    constructor(private garunner: GaRunnerService) { }

    ngOnInit() {
        this.subscribe();
    }

    subscribe(): void {
        this.garunner.registerEmitter();

        this.garunner.output
            .subscribe(output => {
                this.output = output;
            });
    }

}

export type GeneString = {
    code: string,
    cost: number,
    fitness: number,
    score: number
}

export type OutputMessage = {
    topGene: GeneString,
    elements: Array<GeneString>,
    generation: number
}
