import json
import logging
import sys
import gromacs
from grinn_workflow import run_gromacs_simulation, create_logger, suppress_stdout, filterInitialPairsSingleCore, perform_initial_filtering, getChainResnameResnum, process_chunk, calculate_interaction_energies, parse_interaction_energies, cleanUp, source_gmxrc, run_grinn_workflow, parse_args# Import your functions

gromacs.config.setup()

def main():
    # Parse the JSON string passed from the command line
    data = json.loads(sys.argv[1])

    # Set up logging to write to stdout
    logger = logging.getLogger('logger')
    logger.setLevel(logging.INFO)

    # StreamHandler for printing messages to stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter('%(message)s'))  # Simple format with no timestamp or extra info
    handler.flush = sys.stdout.flush
    logger.addHandler(handler)

    # Log that the process is running
    logger.info("gRINN is running. Please wait.")

    try:
        # Run the gRINN workflow
        run_grinn_workflow(**data)

        # Log successful completion
        logger.info("Job completed successfully.")

    except Exception as e:
        # Log an error message if something goes wrong
        #logger.error("An error occurred.")
        # Optionally, print the actual error message for debugging purposes
        logger.error(f"Error details: {str(e)}")

if __name__ == "__main__":
    main()
    