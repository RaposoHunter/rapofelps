#include <stdio.h>

#define MAX_VAL 65 /* maximum function value */

int f (int t) {
    return (t * t - 6 * t - 1);
}

int getAdjust(int least, int highest) {
    int adjust = f(least);

    for (int t = least+1; t <= highest; ++t) {
        int num = f(t);

        if(num < adjust)
            adjust = num;
    }

    if(adjust < 0) 
        adjust *= -1;
    else
        adjust = 0;

    return adjust;
}

int main(void){
    char plot[MAX_VAL + 2]; /* one line of plot */
    int i, t, funval, adjust, least = -6, highest = 12;

    adjust = getAdjust(least, highest);

    /* Displays heading lines */
    for (i = 0; i <= MAX_VAL; i += 5)
        printf("%5d", i-10);

    printf("\n");

    for (i = 0; i <= MAX_VAL; i += 5)
        printf(" |");

    printf("\n");
    /* Initializes plot to all blanks */
    for (i = 0; i <= MAX_VAL + 1; ++i)
        plot[i] = ' ';

    /* Computes and plots f(t) for each value of t from 0 through 10 */
    for (t = least; t <= highest; ++t) {
        //printf("%f ", f(t));
        funval = f(t);
        if(funval <= MAX_VAL-adjust) {
            plot[funval+adjust] = '*';
            plot[funval+adjust + 1] = '\0';
        }
        printf("t=%2d", t);

        if(funval<= MAX_VAL-adjust)
            printf("%s\n", plot);
        else   
            printf("\n");

        if(funval <= MAX_VAL-adjust) {
            plot[funval+adjust] = ' ';
            plot[funval+adjust + 1] = ' ';
        }
    }
}