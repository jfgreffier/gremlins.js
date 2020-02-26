import executeInSeries from '../utils/executeInSeries';
import configurable from '../utils/configurable';
import wait from '../utils/wait';

/**
 * For each species, execute the gremlin 200 times, separated by a 10ms delay
 *
 *   const bySpeciesStrategy = gremlins.strategies.bySpecies();
 *   horde.strategy(bySpeciesStrategy);
 *
 * The actual attack duration depends on the number of species in the horde.
 *
 * The bySpecies strategy can be customized as follows:
 *
 *   bySpeciesStrategy.delay(10); // delay in milliseconds between each gremlin action
 *   bySpeciesStrategy.nb(200);   // number times to execute each gremlin
 *
 * Example usage:
 *
 *   horde
 *     .gremlin(gremlins.species.clicker())
 *     .gremlin(gremlins.species.formFiller())
 *     .strategy(gremlins.strategies.bySpecies()
 *       .delay(1000) // one action per second
 *       .nb(10)      // each gremlin will act 10 times
 *     )
 *     .unleash();
 *
 *   // t     clickerGremlin clicked
 *   // t+1s  clickerGremlin clicked
 *   // ...
 *   // t+9s  clickerGremlin clicked
 *   // t+10s formFillerGremlin filled
 *   // t+11s formFillerGremlin filled
 *   // ...
 *   // t+19s formFillerGremlin filled
 *   // t+20s, end of the attack
 */
export default () => {
    const config = {
        delay: 10, // delay in milliseconds between each attack
        nb: 200, // number of attacks to execute (can be overridden in params)
    };

    let stopped;

    const bySpeciesStrategy = async (newGremlins, params) => {
        console.log('by species called');
        const nb = params && params.nb ? params.nb : config.nb;
        const delay = params && params.delay ? params.delay : config.delay;

        const gremlins = [...newGremlins]; // clone the array to avoid modifying the original
        const horde = this;

        stopped = false;

        for (let gremlinIndex in gremlins) {
            const gremlin = gremlins[gremlinIndex];
            for (let i = 0; i < nb; i++) {
                await wait(delay);
                if (stopped) {
                    return Promise.resolve();
                }
                await executeInSeries([gremlin], [], horde, delay);
            }
        }
        return Promise.resolve();
    };

    bySpeciesStrategy.stop = () => {
        stopped = true;
    };

    configurable(bySpeciesStrategy, config);

    return bySpeciesStrategy;
};
