import click
import six
from termcolor import colored
from pyfiglet import figlet_format


def progbarz():
	six.print_(colored(figlet_format('ProGBarZ', font='slant'), 'white'))



if __name__ == '__main__':
	progbarz()